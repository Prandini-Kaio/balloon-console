import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from '@/core/auth/AuthContext'
import { balloonTheme } from '@/core/theme/theme'
import { AppRoutes } from '@/app/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

const rawBase = import.meta.env.BASE_URL || '/'
const routerBasename = rawBase === '/' ? undefined : rawBase.replace(/\/$/, '')

export function Application() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={balloonTheme}>
        <CssBaseline />
        <BrowserRouter basename={routerBasename}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      {import.meta.env.DEV ? <ReactQueryDevtools buttonPosition="bottom-left" /> : null}
    </QueryClientProvider>
  )
}
