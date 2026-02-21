import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import TranslateIcon from '@mui/icons-material/Translate'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { useUser } from '../context/UserContext'
import { getTextById, listTexts } from '../lib/textsApi'
import { translateText } from '../lib/translationApi'

const TARGET_LANGUAGES = ['en', 'es', 'fr', 'de']

export function StudentDashboard() {
  const { user } = useUser()
  const [texts, setTexts] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedText, setSelectedText] = useState(null)
  const [targetLanguage, setTargetLanguage] = useState(TARGET_LANGUAGES[0])
  const [translation, setTranslation] = useState('')
  const [fromCache, setFromCache] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingText, setLoadingText] = useState(false)
  const [loadingTranslate, setLoadingTranslate] = useState(false)
  const [error, setError] = useState(null)

  const loadTexts = async () => {
    setLoadingList(true)
    try {
      const data = await listTexts()
      setTexts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadTexts()
  }, [])

  const handleSelectText = async (id) => {
    setSelectedId(id)
    if (!id) {
      setSelectedText(null)
      setTranslation('')
      setFromCache(false)
      return
    }

    setLoadingText(true)
    setError(null)
    try {
      const data = await getTextById(id)
      setSelectedText(data)
      setTranslation('')
      setFromCache(false)
      setTargetLanguage(TARGET_LANGUAGES[0])
    } catch (err) {
      console.error(err)
      setError('Could not load the selected text.')
    } finally {
      setLoadingText(false)
    }
  }

  const handleTranslate = async () => {
    if (!selectedText || !targetLanguage) return

    setLoadingTranslate(true)
    setError(null)
    try {
      const data = await translateText({
        textId: selectedText.id,
        content: selectedText.content,
        sourceLanguage: selectedText.language,
        targetLanguage,
      })
      setTranslation(data?.translatedText ?? '')
      setFromCache(Boolean(data?.fromCache))
    } catch (err) {
      console.error(err)
      setError('Translation failed. Please try again.')
    } finally {
      setLoadingTranslate(false)
    }
  }

  // Last viewed text
  const lastText = texts.length > 0 ? texts[0] : null

  return (
    <Box>
      <TopBar
        title={`Welcome, ${user?.name || 'Student'}!`}
        subtitle="Choose a text, then translate it into a language you are learning."
      />

      {/* Last course / quick access */}
      {lastText && !selectedText && (
        <Paper sx={{ p: 2.5, mb: 3, mx: 1, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            My Last Course
          </Typography>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 3 },
            }}
          >
            <CardActionArea onClick={() => handleSelectText(lastText.id)}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LibraryBooksIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {lastText.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Language: {lastText.language}
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Paper>
      )}

      {/* Available courses grid */}
      {!selectedText && (
        <Box sx={{ px: 1, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Courses I Have Joined
          </Typography>
          {loadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : texts.length === 0 ? (
            <Typography variant="body2" color="text.disabled" textAlign="center" sx={{ py: 4 }}>
              No courses available yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {texts.map((text) => (
                <Grid item xs={12} sm={6} md={4} key={text.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <CardActionArea onClick={() => handleSelectText(text.id)}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {text.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Language: {text.language}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                          {text.content}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Selected text detail & translate */}
      {selectedText && (
        <Paper sx={{ p: 3, mx: 1, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedText.title}
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setSelectedText(null)
                  setSelectedId('')
                  setTranslation('')
                }}
              >
                ← Back
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Source language: {selectedText.language}
            </Typography>
            <TextField
              label="Original content"
              value={selectedText.content}
              multiline
              minRows={4}
              InputProps={{ readOnly: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <FormControl sx={{ minWidth: 160 }} size="small">
                <InputLabel id="target-lang-label">Target language</InputLabel>
                <Select
                  labelId="target-lang-label"
                  label="Target language"
                  value={targetLanguage}
                  onChange={(event) => setTargetLanguage(event.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {TARGET_LANGUAGES.map((lang) => (
                    <MenuItem value={lang} key={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleTranslate}
                disabled={loadingTranslate}
                startIcon={<TranslateIcon />}
                sx={{ borderRadius: 2 }}
              >
                {loadingTranslate ? 'Translating…' : 'Translate'}
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {translation && (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Translated text</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fromCache ? '(from cache)' : '(new translation)'}
                  </Typography>
                </Stack>
                <TextField
                  value={translation}
                  multiline
                  minRows={4}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {loadingText && (
        <Paper sx={{ p: 3, mx: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </Paper>
      )}
    </Box>
  )
}
