import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from '@/core/auth/AuthContext'
import { AppRoutes } from '@/app/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6a1b9a' },
    secondary: { main: '#00897b' },
  },
})

export function Application() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      {import.meta.env.DEV ? <ReactQueryDevtools buttonPosition="bottom-left" /> : null}
    </QueryClientProvider>
  )
}
