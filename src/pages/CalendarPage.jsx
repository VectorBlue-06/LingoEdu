import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ClassIcon from '@mui/icons-material/Class'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { useUser } from '../context/UserContext'
import { useI18n } from '../context/I18nContext'
import { listTexts } from '../lib/textsApi'
import { listJoinedClassrooms, listTeacherClassrooms } from '../lib/classroomsApi'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
}

export function CalendarPage() {
    const { user } = useUser()
    const { t } = useI18n()
    const isTeacher = user?.role === 'teacher'

    const [loading, setLoading] = useState(true)
    const [classrooms, setClassrooms] = useState([])
    const [recentTexts, setRecentTexts] = useState([])

    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())

    // Load classrooms and their recent texts
    useEffect(() => {
        if (!user?.name) return
        ;(async () => {
            setLoading(true)
            try {
                const rooms = isTeacher
                    ? await listTeacherClassrooms(user.name)
                    : await listJoinedClassrooms(user.name)
                setClassrooms(rooms)

                // Load texts for all classrooms
                const allTexts = []
                for (const room of rooms) {
                    try {
                        const texts = await listTexts(room.code)
                        texts.forEach((tx) => {
                            allTexts.push({ ...tx, classroomName: room.name })
                        })
                    } catch {
                        /* skip */
                    }
                }
                setRecentTexts(allTexts)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        })()
    }, [user?.name, isTeacher])

    // Group texts by date (day of month)
    const textsByDate = useMemo(() => {
        const map = {}
        recentTexts.forEach((tx) => {
            const d = new Date(tx.created_at)
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                const day = d.getDate()
                if (!map[day]) map[day] = []
                map[day].push(tx)
            }
        })
        return map
    }, [recentTexts, currentMonth, currentYear])

    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear((y) => y - 1)
        } else {
            setCurrentMonth((m) => m - 1)
        }
    }

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear((y) => y + 1)
        } else {
            setCurrentMonth((m) => m + 1)
        }
    }

    // Upcoming texts (created in future or recent past 7 days)
    const upcomingTexts = useMemo(() => {
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return recentTexts
            .filter((tx) => new Date(tx.created_at) >= weekAgo)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
    }, [recentTexts])

    return (
        <Box className="page-enter">
            <TopBar title={t('calendar.title')} subtitle={t('calendar.subtitle')} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ px: 2, pb: 3 }}>
                    {/* Calendar grid */}
                    <Grid item xs={12} md={9}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                {/* Month navigation */}
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                    <Typography
                                        variant="body1"
                                        sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                                        onClick={handlePrevMonth}
                                    >
                                        ← {t('calendar.prev')}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {monthName} {currentYear}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                                        onClick={handleNextMonth}
                                    >
                                        {t('calendar.next')} →
                                    </Typography>
                                </Stack>

                                {/* Weekday headers */}
                                <Grid container spacing={0}>
                                    {WEEKDAYS.map((d) => (
                                        <Grid item xs={12 / 7} key={d}>
                                            <Typography
                                                variant="body2"
                                                sx={{ textAlign: 'center', display: 'block', fontWeight: 700, color: 'text.secondary', pb: 1, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}
                                            >
                                                {d}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Days */}
                                <Grid container spacing={0}>
                                    {/* Empty cells for days before the 1st */}
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <Grid item xs={12 / 7} key={`e-${i}`}>
                                            <Box sx={{ minHeight: { xs: 72, sm: 90, md: 110 } }} />
                                        </Grid>
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1
                                        const isToday =
                                            day === today.getDate() &&
                                            currentMonth === today.getMonth() &&
                                            currentYear === today.getFullYear()
                                        const dayTexts = textsByDate[day] || []

                                        return (
                                            <Grid item xs={12 / 7} key={day}>
                                                <Box
                                                    sx={{
                                                        minHeight: { xs: 72, sm: 90, md: 110 },
                                                        border: '1px solid',
                                                        borderColor: isToday ? 'primary.main' : 'divider',
                                                        borderRadius: 1.5,
                                                        p: 1,
                                                        bgcolor: isToday ? 'primary.main' : 'transparent',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        cursor: 'default',
                                                        transition: 'background-color 0.15s ease',
                                                        '&:hover': {
                                                            bgcolor: isToday ? 'primary.dark' : (theme) => theme.palette.mode === 'light' ? 'rgba(79, 60, 175, 0.04)' : 'rgba(207, 206, 224, 0.06)',
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: isToday ? 700 : 500,
                                                            color: isToday ? '#fff' : 'text.primary',
                                                            fontSize: { xs: 13, md: 15 },
                                                        }}
                                                    >
                                                        {day}
                                                    </Typography>
                                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                                                        {dayTexts.slice(0, 2).map((tx, idx) => (
                                                            <Typography
                                                                key={idx}
                                                                variant="caption"
                                                                noWrap
                                                                sx={{
                                                                    fontSize: 10,
                                                                    bgcolor: isToday ? 'rgba(255,255,255,0.25)' : 'secondary.main',
                                                                    color: isToday ? '#fff' : '#fff',
                                                                    borderRadius: 0.5,
                                                                    px: 0.5,
                                                                    lineHeight: 1.6,
                                                                }}
                                                            >
                                                                {tx.title}
                                                            </Typography>
                                                        ))}
                                                        {dayTexts.length > 2 && (
                                                            <Typography variant="caption" sx={{ fontSize: 9, color: isToday ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                                                                +{dayTexts.length - 2} more
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    {dayTexts.length > 0 && dayTexts.length <= 2 && (
                                                        <Chip
                                                            label={`${dayTexts.length}`}
                                                            size="small"
                                                            color="secondary"
                                                            sx={{ height: 18, fontSize: 11, mt: 'auto', alignSelf: 'flex-start' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Upcoming / recent texts sidebar */}
                    <Grid item xs={12} md={3}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LibraryBooksIcon color="primary" fontSize="small" />
                                    {t('calendar.upcoming')}
                                </Typography>

                                {upcomingTexts.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <CalendarMonthIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {t('calendar.noUpcoming')}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {upcomingTexts.map((tx) => (
                                            <Box
                                                key={tx.id}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 1.5,
                                                    bgcolor: (theme) =>
                                                        theme.palette.mode === 'light'
                                                            ? 'rgba(0,0,0,0.03)'
                                                            : 'rgba(255,255,255,0.04)',
                                                }}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                    {tx.title}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <ClassIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {tx.classroomName}
                                                    </Typography>
                                                    {tx.created_by && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            · by {tx.created_by}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                                <Typography variant="caption" color="text.disabled">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    )
}
