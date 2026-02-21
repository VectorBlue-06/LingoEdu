import AddIcon from '@mui/icons-material/Add'
import ClassIcon from '@mui/icons-material/Class'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import LinkIcon from '@mui/icons-material/Link'
import PhotoIcon from '@mui/icons-material/Photo'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SchoolIcon from '@mui/icons-material/School'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { useUser } from '../context/UserContext'
import { useI18n } from '../context/I18nContext'
import { createText, listTexts } from '../lib/textsApi'
import { createClassroom, listTeacherClassrooms, deleteClassroom } from '../lib/classroomsApi'
import { LANGUAGES } from '../lib/languages'

export function TeacherDashboard() {
  const { user } = useUser()
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [texts, setTexts] = useState([])
  const [listLoading, setListLoading] = useState(false)

  // Upload tabs: 0=Text 1=PDF 2=Photo 3=Video Link
  const [uploadTab, setUploadTab] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileTitle, setFileTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')

  // Classrooms (Supabase)
  const [classrooms, setClassrooms] = useState([])
  const [classroomsLoading, setClassroomsLoading] = useState(false)
  const [newClassroomName, setNewClassroomName] = useState('')
  const [activeClassroom, setActiveClassroom] = useState(null)

  // Load classrooms from Supabase on mount
  useEffect(() => {
    if (!user?.name) return
    ;(async () => {
      setClassroomsLoading(true)
      try {
        const data = await listTeacherClassrooms(user.name)
        setClassrooms(data)
      } catch (err) {
        console.error('Failed to load classrooms:', err)
      } finally {
        setClassroomsLoading(false)
      }
    })()
  }, [user?.name])

  const loadTextsForClassroom = async (code) => {
    setListLoading(true)
    try {
      const data = await listTexts(code)
      setTexts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    if (activeClassroom) {
      loadTextsForClassroom(activeClassroom.code)
    } else {
      setTexts([])
    }
  }, [activeClassroom])

  /* ── Text submit ── */
  const handleSubmitText = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim() || !content.trim() || !language || !activeClassroom) {
      setError(t('teacher.fillFields'))
      return
    }

    setLoading(true)
    try {
      await createText({
        title: title.trim(),
        language: language.code,
        content: content.trim(),
        classroom_code: activeClassroom.code,
        created_by: user?.name || 'Unknown',
      })
      setTitle('')
      setContent('')
      setSuccess(t('teacher.textSaved'))
      await loadTextsForClassroom(activeClassroom.code)
    } catch (err) {
      console.error(err)
      setError(t('teacher.saveError'))
    } finally {
      setLoading(false)
    }
  }

  /* ── File upload ── */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!fileTitle) setFileTitle(file.name)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !fileTitle.trim()) {
      setError(t('teacher.selectFileError'))
      return
    }
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      setSuccess(t('teacher.fileReady'))
      setSelectedFile(null)
      setFileTitle('')
    } catch {
      setError(t('teacher.uploadError'))
    } finally {
      setLoading(false)
    }
  }

  /* ── Video link ── */
  const handleAddVideo = () => {
    if (!videoUrl.trim() || !videoTitle.trim()) {
      setError(t('teacher.videoFieldsError'))
      return
    }
    setError(null)
    setSuccess(t('teacher.videoAdded'))
    setVideoUrl('')
    setVideoTitle('')
  }

  /* ── Classroom management (Supabase) ── */
  const handleCreateClassroom = async () => {
    if (!newClassroomName.trim()) return
    try {
      const room = await createClassroom({
        name: newClassroomName.trim(),
        teacher_name: user?.name || 'Unknown',
      })
      setClassrooms((prev) => [room, ...prev])
      setNewClassroomName('')
    } catch (err) {
      console.error('Failed to create classroom:', err)
      setError('Could not create classroom. Please try again.')
    }
  }

  const handleDeleteClassroom = async (id) => {
    try {
      await deleteClassroom(id)
      setClassrooms((prev) => prev.filter((c) => c.id !== id))
      if (activeClassroom?.id === id) setActiveClassroom(null)
    } catch (err) {
      console.error('Failed to delete classroom:', err)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <Box className="page-enter">
      <TopBar title={`${t('teacher.welcome')}, ${user?.name || 'Teacher'}!`} />

      {/* ── Quick stats ── */}
      <Grid container spacing={2} sx={{ mb: 3, px: 1 }}>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" className="card-enter" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <UploadFileIcon sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {texts.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('teacher.totalUploads')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" className="card-enter" sx={{ borderRadius: 2, animationDelay: '0.08s' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <SchoolIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 0.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {classrooms.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('teacher.classrooms')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Classroom management ── */}
      <Paper className="card-enter" sx={{ p: 3, mb: 3, borderRadius: 2, animationDelay: '0.12s' }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.primary',
          }}
        >
          <ClassIcon color="primary" /> {t('teacher.myClassrooms')}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder={t('teacher.classroomName')}
            value={newClassroomName}
            onChange={(e) => setNewClassroomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateClassroom()}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            onClick={handleCreateClassroom}
            disabled={!newClassroomName.trim()}
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            {t('common.create')}
          </Button>
        </Stack>

        {classrooms.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('teacher.noClassrooms')}
          </Typography>
        ) : (
          <List dense>
            {classrooms.map((room) => (
              <ListItem
                key={room.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title={t('teacher.manageClassroom')}>
                      <IconButton size="small" color="primary" onClick={() => setActiveClassroom(room)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('teacher.copyCode')}>
                      <IconButton size="small" onClick={() => handleCopyCode(room.code)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('teacher.deleteClassroom')}>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClassroom(room.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: (theme) =>
                    activeClassroom?.id === room.id
                      ? theme.palette.mode === 'light'
                        ? 'rgba(76,175,80,0.10)'
                        : 'rgba(102,187,106,0.12)'
                      : theme.palette.mode === 'light'
                        ? 'rgba(0,0,0,0.02)'
                        : 'rgba(255,255,255,0.03)',
                  '&:hover': { bgcolor: 'action.selected' },
                  cursor: 'pointer',
                }}
                onClick={() => setActiveClassroom(room)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ClassIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={room.name}
                  secondary={`${t('teacher.code')}: ${room.code}`}
                  primaryTypographyProps={{ fontWeight: 500, color: 'text.primary' }}
                  secondaryTypographyProps={{ fontFamily: 'monospace', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* ── Active classroom: upload + texts ── */}
      {activeClassroom && (
        <>
          <Paper className="card-enter" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClassIcon color="primary" /> {activeClassroom.name}
                <Chip label={activeClassroom.code} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
              </Typography>
              <Button size="small" onClick={() => setActiveClassroom(null)} sx={{ borderRadius: 2 }}>
                {t('common.back')}
              </Button>
            </Stack>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('teacher.uploadContent')}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Tabs
              value={uploadTab}
              onChange={(_, v) => setUploadTab(v)}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<UploadFileIcon />} label={t('teacher.text')} iconPosition="start" />
              <Tab icon={<PictureAsPdfIcon />} label={t('teacher.pdf')} iconPosition="start" />
              <Tab icon={<PhotoIcon />} label={t('teacher.photo')} iconPosition="start" />
              <Tab icon={<LinkIcon />} label={t('teacher.videoLink')} iconPosition="start" />
            </Tabs>

            {/* Text tab */}
            {uploadTab === 0 && (
              <Box component="form" onSubmit={handleSubmitText} noValidate>
                <Stack spacing={2}>
                  <TextField
                    label={t('teacher.title')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Autocomplete
                    options={LANGUAGES}
                    getOptionLabel={(option) => option.label}
                    value={language}
                    onChange={(_, v) => { if (v) setLanguage(v) }}
                    renderInput={(params) => <TextField {...params} label={t('teacher.language')} required size="small" />}
                    disableClearable
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    label={t('teacher.content')}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    minRows={4}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={loading} sx={{ borderRadius: 2 }}>
                      {loading ? t('teacher.saving') : t('teacher.saveText')}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}

            {/* PDF tab */}
            {uploadTab === 1 && (
              <Stack spacing={2}>
                <TextField label={t('teacher.title')} value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Button variant="outlined" component="label" startIcon={<PictureAsPdfIcon />} sx={{ borderRadius: 2, justifyContent: 'flex-start' }}>
                  {selectedFile?.name || t('teacher.choosePdf')}
                  <input type="file" hidden accept=".pdf,application/pdf" onChange={handleFileSelect} />
                </Button>
                <Box sx={{ textAlign: 'right' }}>
                  <Button variant="contained" startIcon={<UploadFileIcon />} disabled={loading || !selectedFile} onClick={handleFileUpload} sx={{ borderRadius: 2 }}>
                    {loading ? t('teacher.uploading') : t('teacher.uploadPdf')}
                  </Button>
                </Box>
              </Stack>
            )}

            {/* Photo tab */}
            {uploadTab === 2 && (
              <Stack spacing={2}>
                <TextField label={t('teacher.title')} value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Button variant="outlined" component="label" startIcon={<PhotoIcon />} sx={{ borderRadius: 2, justifyContent: 'flex-start' }}>
                  {selectedFile?.name || t('teacher.chooseImage')}
                  <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
                </Button>
                {selectedFile && selectedFile.type?.startsWith('image/') && (
                  <Box sx={{ mt: 1 }}>
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
                  </Box>
                )}
                <Box sx={{ textAlign: 'right' }}>
                  <Button variant="contained" startIcon={<UploadFileIcon />} disabled={loading || !selectedFile} onClick={handleFileUpload} sx={{ borderRadius: 2 }}>
                    {loading ? t('teacher.uploading') : t('teacher.uploadPhoto')}
                  </Button>
                </Box>
              </Stack>
            )}

            {/* Video Link tab */}
            {uploadTab === 3 && (
              <Stack spacing={2}>
                <TextField label={t('teacher.videoTitle')} value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField label={t('teacher.videoUrl')} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} size="small" placeholder="https://www.youtube.com/watch?v=..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Button variant="contained" startIcon={<LinkIcon />} disabled={!videoUrl.trim() || !videoTitle.trim()} onClick={handleAddVideo} sx={{ borderRadius: 2 }}>
                    {t('teacher.addVideoLink')}
                  </Button>
                </Box>
              </Stack>
            )}
          </Paper>

          {/* Texts in this classroom */}
          <Paper className="card-enter" sx={{ p: 3, borderRadius: 2, animationDelay: '0.1s' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('teacher.existingTexts')}
            </Typography>
            {listLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : texts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('teacher.noTexts')}
              </Typography>
            ) : (
              <List dense>
                {texts.map((text) => (
                  <ListItem key={text.id} divider sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                    <ListItemText
                      primary={text.title}
                      secondary={`${t('teacher.language')}: ${text.language}${text.created_by ? ` · by ${text.created_by}` : ''}`}
                      primaryTypographyProps={{ color: 'text.primary' }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </>
      )}
    </Box>
  )
}
