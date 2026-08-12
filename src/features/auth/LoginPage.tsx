import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { isApiFailure } from '@/core/api/types'
import { mapUser } from '@/core/auth/mapUser'
import { useAuth } from '@/core/auth/AuthContext'
import { loginWithEmail } from '@/features/auth/auth.api'
import { BrandLogo } from '@/shared/ui/BrandLogo'
import { balloonColors } from '@/core/theme/tokens'

export function LoginPage() {
  const { login, token, ready } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ready && token) navigate('/admin/dashboard', { replace: true })
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
    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: `linear-gradient(145deg, ${balloonColors.navy} 0%, ${balloonColors.primary} 48%, ${balloonColors.surface} 100%)`,
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid rgba(32, 100, 172, 0.16)',
        }}
      >
        <Stack spacing={1.5} sx={{ mb: 3, alignItems: 'flex-start' }}>
          <BrandLogo variant="lateral" height={44} />
          <Typography variant="h5" component="h1">
            Balloon Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acesso para conta Balloon e empresas assinantes.
          </Typography>
        </Stack>
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
    </Box>
  )
}
