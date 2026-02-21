import AddIcon from '@mui/icons-material/Add'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import DeleteIcon from '@mui/icons-material/Delete'
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

const TODO_STORAGE_KEY = 'lingo-todos'

function loadTodos() {
    try {
        const stored = window.localStorage.getItem(TODO_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

function saveTodos(todos) {
    try {
        window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
    } catch {
        // ignore
    }
}

export function UserPanel() {
    const { user, logout } = useUser()
    const { mode, toggleMode } = useThemeMode()
    const navigate = useNavigate()
    const [todos, setTodos] = useState(loadTodos)
    const [newTodo, setNewTodo] = useState('')

    useEffect(() => {
        saveTodos(todos)
    }, [todos])

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
            }}
        >
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
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {user?.name || 'Guest'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {user?.role || ''}
                    </Typography>
                </Box>
                <Tooltip title="Settings">
                    <IconButton size="small" onClick={() => navigate('/settings')}>
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            {/* Theme toggle & Logout */}
            <Stack direction="row" spacing={1} justifyContent="center">
                <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                    <IconButton onClick={toggleMode} size="small">
                        {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Logout">
                    <IconButton onClick={handleLogout} size="small" color="error">
                        <LogoutIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Divider />

            {/* To-do list */}
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        My To-Do List
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            size="small"
                            placeholder="Add a task..."
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
                            No tasks yet
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
            </Card>
        </Box>
    )
}
