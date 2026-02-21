import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Checkbox,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useThemeMode } from '../context/ThemeContext'
import { useI18n } from '../context/I18nContext'

const PANEL_COLLAPSED_KEY = 'lingo-panel-collapsed'

function getTodoKey(userName) {
    return `lingo-todos-${userName || 'guest'}`
}

function loadTodos(userName) {
    try {
        const stored = window.localStorage.getItem(getTodoKey(userName))
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveTodos(userName, todos) {
    try {
        window.localStorage.setItem(getTodoKey(userName), JSON.stringify(todos))
    } catch {
        // ignore
    }
}

export function UserPanel() {
    const { user, logout } = useUser()
    const { mode, toggleMode } = useThemeMode()
    const { t, isTranslated, tOriginal } = useI18n()
    const navigate = useNavigate()

    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem(PANEL_COLLAPSED_KEY) === 'true'
        } catch {
            return false
        }
    })

    const [todos, setTodos] = useState(() => loadTodos(user?.name))
    const [newTodo, setNewTodo] = useState('')

    useEffect(() => {
        try {
            localStorage.setItem(PANEL_COLLAPSED_KEY, String(collapsed))
        } catch {
            /* ignore */
        }
    }, [collapsed])

    useEffect(() => {
        saveTodos(user?.name, todos)
    }, [todos, user?.name])

    // Reload todos when user changes
    useEffect(() => {
        setTodos(loadTodos(user?.name))
    }, [user?.name])

    const handleAddTodo = () => {
        const text = newTodo.trim()
        if (!text) return
        setTodos((prev) => [...prev, { id: Date.now(), text, done: false }])
        setNewTodo('')
    }

    const handleToggleTodo = (id) => {
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        )
    }

    const handleDeleteTodo = (id) => {
        setTodos((prev) => prev.filter((t) => t.id !== id))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTodo()
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?'

    /* ── Collapsed state ── */
    if (collapsed) {
        return (
            <Box
                sx={{
                    width: 48,
                    flexShrink: 0,
                    borderLeft: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pt: 2,
                    gap: 1.5,
                    bgcolor: 'background.paper',
                    height: '100vh',
                }}
            >
                <Tooltip title={isTranslated ? `${t('panel.expand')} (${tOriginal('panel.expand')})` : t('panel.expand')} placement="left">
                    <IconButton size="small" onClick={() => setCollapsed(false)}>
                        <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Divider sx={{ width: '80%' }} />
                <Tooltip title={user?.name || 'User'} placement="left">
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                        onClick={() => setCollapsed(false)}
                    >
                        {initials}
                    </Avatar>
                </Tooltip>
                <Tooltip title={mode === 'light' ? t('panel.darkMode') : t('panel.lightMode')} placement="left">
                    <IconButton size="small" onClick={toggleMode}>
                        {mode === 'light' ? <DarkModeIcon sx={{ fontSize: 18 }} /> : <LightModeIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                </Tooltip>
            </Box>
        )
    }

    /* ── Expanded state ── */
    return (
        <Box
            sx={{
                width: 280,
                flexShrink: 0,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderLeft: 1,
                borderColor: 'divider',
                height: '100vh',
                overflow: 'auto',
                bgcolor: 'background.paper',
                transition: 'width 0.2s ease',
            }}
        >
            {/* Collapse button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title={isTranslated ? `${t('panel.collapse')} (${tOriginal('panel.collapse')})` : t('panel.collapse')}>
                    <IconButton size="small" onClick={() => setCollapsed(true)}>
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Profile section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                    sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'primary.main',
                        fontSize: 16,
                        fontWeight: 700,
                    }}
                >
                    {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {user?.name || 'Guest'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {user?.role || ''}
                    </Typography>
                </Box>
                <Tooltip title={isTranslated ? `${t('panel.settings')} (${tOriginal('panel.settings')})` : t('panel.settings')}>
                    <IconButton size="small" onClick={() => navigate('/settings')}>
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            {/* Theme toggle & Logout */}
            <Stack direction="row" spacing={1} justifyContent="center">
                <Tooltip title={mode === 'light' ? t('panel.darkMode') : t('panel.lightMode')}>
                    <IconButton onClick={toggleMode} size="small">
                        {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title={isTranslated ? `${t('panel.logout')} (${tOriginal('panel.logout')})` : t('panel.logout')}>
                    <IconButton onClick={handleLogout} size="small" color="error">
                        <LogoutIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Divider />

            {/* To-do list */}
            <Card
                variant="outlined"
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    bgcolor: (theme) =>
                        theme.palette.mode === 'light' ? '#fafbfc' : '#252530',
                }}
            >
                <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                        title={isTranslated ? tOriginal('panel.todoTitle') : undefined}
                    >
                        {t('panel.todoTitle')}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            size="small"
                            placeholder={t('panel.addTask')}
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={handleAddTodo}
                            disabled={!newTodo.trim()}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </CardContent>
                <List dense sx={{ flex: 1, overflow: 'auto', pt: 0 }}>
                    {todos.length === 0 ? (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', textAlign: 'center', py: 3 }}
                        >
                            {t('panel.noTasks')}
                        </Typography>
                    ) : (
                        todos.map((todo) => (
                            <ListItem
                                key={todo.id}
                                dense
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={() => handleDeleteTodo(todo.id)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                                sx={{ px: 2 }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Checkbox
                                        edge="start"
                                        checked={todo.done}
                                        onChange={() => handleToggleTodo(todo.id)}
                                        size="small"
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={todo.text}
                                    primaryTypographyProps={{
                                        fontSize: 13,
                                        sx: {
                                            textDecoration: todo.done ? 'line-through' : 'none',
                                            color: todo.done ? 'text.disabled' : 'text.primary',
                                        },
                                    }}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
                {/* Local-only notice */}
                <Box
                    sx={{
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        borderTop: 1,
                        borderColor: 'divider',
                    }}
                >
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}
                        title={isTranslated ? tOriginal('panel.todoNotice') : undefined}
                    >
                        {t('panel.todoNotice')}
                    </Typography>
                </Box>
            </Card>
        </Box>
    )
}
