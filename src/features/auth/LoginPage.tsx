import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material'
import { isApiFailure } from '@/core/api/types'
import { mapUser } from '@/core/auth/mapUser'
import { useAuth } from '@/core/auth/AuthContext'
import { loginWithEmail } from '@/features/auth/auth.api'

export function LoginPage() {
  const { login, token, ready } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && token) navigate('/admin/eventos', { replace: true })
  }, [ready, token, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await loginWithEmail({ email, password })
    setLoading(false)
    if (isApiFailure(res)) {
      setError(res.message)
      return
    }
    const data = res.data
    if (!data.success || !data.token || !data.user) {
      setError(data.message || 'Credenciais inválidas')
      return
    }
    login(data.token, mapUser(data.user))
    navigate('/admin/eventos', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }} elevation={2}>
        <Typography variant="h5" gutterBottom>
          Balloon Admin
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Acesso interno
        </Typography>
        <Box component="form" onSubmit={onSubmit}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
