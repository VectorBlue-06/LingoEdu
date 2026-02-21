import AddIcon from '@mui/icons-material/Add'
import SchoolIcon from '@mui/icons-material/School'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { useUser } from '../context/UserContext'
import { createText, listTexts } from '../lib/textsApi'

const LANGUAGE_OPTIONS = ['en', 'es', 'fr', 'de']

export function TeacherDashboard() {
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [texts, setTexts] = useState([])
  const [listLoading, setListLoading] = useState(false)

  const hasFormErrors = !title.trim() || !content.trim() || !language

  const loadTexts = async () => {
    setListLoading(true)
    try {
      const data = await listTexts()
      setTexts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    loadTexts()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (hasFormErrors) {
      setError('Please fill in all fields before saving.')
      return
    }

    setLoading(true)
    try {
      await createText({
        title: title.trim(),
        language,
        content: content.trim(),
      })
      setTitle('')
      setContent('')
      await loadTexts()
    } catch (err) {
      console.error(err)
      setError('Could not save the text. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <TopBar
        title={`Welcome back, ${user?.name || 'Teacher'}!`}
        subtitle="Create study texts that your students can later translate and read."
      />

      {/* Quick stats */}
      <Grid container spacing={2} sx={{ mb: 3, px: 1 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <UploadFileIcon sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {texts.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Uploads
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <SchoolIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                —
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {LANGUAGE_OPTIONS.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Languages
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload form */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Upload New Text
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Language (e.g. en, es)"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              size="small"
              helperText="Use a short language code like en, es, fr."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              minRows={4}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                {loading ? 'Saving…' : 'Save text'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Existing texts */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Existing Texts
        </Typography>
        {listLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : texts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No texts yet. Create the first one above.
          </Typography>
        ) : (
          <List dense>
            {texts.map((text) => (
              <ListItem
                key={text.id}
                divider
                sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemText
                  primary={text.title}
                  secondary={`Language: ${text.language}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  )
}
