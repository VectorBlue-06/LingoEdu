import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ExploreIcon from '@mui/icons-material/Explore'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import ClassIcon from '@mui/icons-material/Class'
import SettingsIcon from '@mui/icons-material/Settings'
import {
    Box,
    Collapse,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useI18n } from '../context/I18nContext'

const DRAWER_WIDTH = 240

export function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useUser()
    const { t, tOriginal, isTranslated } = useI18n()
    const [coursesOpen, setCoursesOpen] = useState(false)

    const dashboardPath = user?.role === 'teacher' ? '/teacher' : '/student'

    const navItems = [
        { label: t('nav.dashboard'), englishLabel: tOriginal('nav.dashboard'), icon: <DashboardIcon />, path: dashboardPath },
        {
            label: t('nav.courses'),
            englishLabel: tOriginal('nav.courses'),
            icon: <LibraryBooksIcon />,
            expandable: true,
            children: [
                { label: t('nav.allCourses'), englishLabel: tOriginal('nav.allCourses'), path: '/courses' },
            ],
        },
        { label: t('nav.calendar'), englishLabel: tOriginal('nav.calendar'), icon: <CalendarMonthIcon />, path: '/calendar' },
        { label: t('nav.classes'), englishLabel: tOriginal('nav.classes'), icon: <ClassIcon />, path: '/classes' },
    ]

    const bottomItems = [
        { label: t('nav.settings'), englishLabel: tOriginal('nav.settings'), icon: <SettingsIcon />, path: '/settings' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    bgcolor: 'grey.900',
                    color: 'grey.100',
                    borderRight: 'none',
                },
            }}
        >
            {/* Branding */}
            <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#fff',
                    }}
                >
                    TB
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                    {t('app.name')}
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'grey.800' }} />

            {/* Main nav */}
            <List sx={{ flex: 1, pt: 1 }}>
                {navItems.map((item) =>
                    item.expandable ? (
                        <Box key={item.label}>
                            <ListItemButton
                                onClick={() => setCoursesOpen(!coursesOpen)}
                                title={isTranslated ? item.englishLabel : undefined}
                                sx={{
                                    mx: 1,
                                    borderRadius: 2,
                                    mb: 0.5,
                                    '&:hover': { bgcolor: 'grey.800' },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'grey.400', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                                />
                                {coursesOpen ? (
                                    <ExpandLess sx={{ color: 'grey.500', fontSize: 20 }} />
                                ) : (
                                    <ExpandMore sx={{ color: 'grey.500', fontSize: 20 }} />
                                )}
                            </ListItemButton>
                            <Collapse in={coursesOpen} timeout="auto" unmountOnExit>
                                <List disablePadding>
                                    {item.children.map((child) => (
                                        <ListItemButton
                                            key={child.label}
                                            onClick={() => navigate(child.path)}
                                            selected={isActive(child.path)}
                                            title={isTranslated ? child.englishLabel : undefined}
                                            sx={{
                                                pl: 7,
                                                mx: 1,
                                                borderRadius: 2,
                                                mb: 0.5,
                                                '&.Mui-selected': {
                                                    bgcolor: 'primary.dark',
                                                    color: 'primary.contrastText',
                                                    '&:hover': { bgcolor: 'primary.dark' },
                                                },
                                                '&:hover': { bgcolor: 'grey.800' },
                                            }}
                                        >
                                            <ListItemText
                                                primary={child.label}
                                                primaryTypographyProps={{ fontSize: 13 }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    ) : (
                        <ListItemButton
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            selected={isActive(item.path)}
                            title={isTranslated ? item.englishLabel : undefined}
                            sx={{
                                mx: 1,
                                borderRadius: 2,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.dark',
                                    color: 'primary.contrastText',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                },
                                '&:hover': { bgcolor: 'grey.800' },
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.light' : 'grey.400', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                            />
                        </ListItemButton>
                    ),
                )}
            </List>

            <Divider sx={{ borderColor: 'grey.800' }} />

            {/* Bottom nav */}
            <List sx={{ pb: 1 }}>
                {bottomItems.map((item) => (
                    <ListItemButton
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        selected={isActive(item.path)}
                        title={isTranslated ? item.englishLabel : undefined}
                        sx={{
                            mx: 1,
                            borderRadius: 2,
                            mb: 0.5,
                            '&.Mui-selected': {
                                bgcolor: 'primary.dark',
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' },
                            },
                            '&:hover': { bgcolor: 'grey.800' },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'grey.400', minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    )
}
