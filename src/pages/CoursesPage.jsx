import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { listTexts } from '../lib/textsApi'
import { TopBar } from '../components/TopBar'
import { useI18n } from '../context/I18nContext'

export function CoursesPage() {
    const { t } = useI18n()
    const [texts, setTexts] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await listTexts()
                setTexts(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <Box className="page-enter">
            <TopBar title={t('courses.title')} subtitle={t('courses.subtitle')} />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : texts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LibraryBooksIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">{t('courses.noCourses')}</Typography>
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ p: 2 }}>
                    {texts.map((text) => (
                        <Grid item xs={12} sm={6} md={4} key={text.id}>
                            <Card
                                variant="outlined"
                                className="card-enter"
                                sx={{
                                    borderRadius: 2,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                                    cursor: 'pointer',
                                }}
                            >
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {text.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {text.language}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 1, color: 'text.secondary' }}
                                        noWrap
                                    >
                                        {text.content}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    )
}
