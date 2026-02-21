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

export function CoursesPage() {
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
        <Box>
            <TopBar title="My Courses" subtitle="Browse available study materials" />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : texts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LibraryBooksIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No courses available yet.</Typography>
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ p: 2 }}>
                    {texts.map((text) => (
                        <Grid item xs={12} sm={6} md={4} key={text.id}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: 4 },
                                    cursor: 'pointer',
                                }}
                            >
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {text.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Language: {text.language}
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
