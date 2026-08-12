import { createTheme } from '@mui/material/styles'
import { balloonColors, balloonFonts } from '@/core/theme/tokens'

export const balloonTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: balloonColors.primary,
      dark: balloonColors.navy,
      light: balloonColors.accent,
      contrastText: balloonColors.white,
    },
    secondary: {
      main: balloonColors.accent,
      contrastText: balloonColors.navy,
    },
    background: {
      default: balloonColors.surface,
      paper: balloonColors.white,
    },
    text: {
      primary: balloonColors.black,
      secondary: 'rgba(4, 4, 4, 0.68)',
    },
    divider: 'rgba(32, 100, 172, 0.16)',
  },
  typography: {
    fontFamily: balloonFonts.body,
    h1: { fontFamily: balloonFonts.display, fontWeight: 600 },
    h2: { fontFamily: balloonFonts.display, fontWeight: 600 },
    h3: { fontFamily: balloonFonts.display, fontWeight: 600 },
    h4: { fontFamily: balloonFonts.display, fontWeight: 600 },
    h5: { fontFamily: balloonFonts.display, fontWeight: 600 },
    h6: { fontFamily: balloonFonts.display, fontWeight: 600 },
    button: { fontFamily: balloonFonts.display, fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: balloonColors.surface,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(90deg, ${balloonColors.navy} 0%, ${balloonColors.primary} 100%)`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid rgba(32, 100, 172, 0.16)`,
          backgroundColor: balloonColors.white,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(32, 100, 172, 0.12)',
        },
      },
    },
  },
})
