import { createTheme } from '@mantine/core'
import { colimaBlue, colimaGold, colimaTeal, neutralSlate, statusAmber, statusGreen, statusRed } from './palette'

export const appTheme = createTheme({
  fontFamily: 'Inter, Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: { fontFamily: 'Space Grotesk, Inter, Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' },
  defaultRadius: 'md',
  spacing: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  breakpoints: { xs: '30em', sm: '40em', md: '48em', lg: '64em', xl: '80em' },
  colors: {
    colimaBlue,
    colimaGold,
    colimaTeal,
    neutralSlate,
    statusGreen,
    statusRed,
    statusAmber,
  },
  primaryColor: 'colimaBlue',
  primaryShade: { light: 6, dark: 3 },
  components: {
    Button: {
      defaultProps: { radius: 'xl', fw: 600 },
      styles: {
        root: {
          transition: 'transform 120ms ease, box-shadow 160ms ease',
          boxShadow: '0 8px 20px rgba(17, 71, 111, 0.15)',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 10px 26px rgba(17, 71, 111, 0.22)' },
        },
      },
    },
    Paper: {
      defaultProps: { radius: 'lg', shadow: 'md', p: 'lg' },
    },
    Card: { defaultProps: { radius: 'lg', withBorder: true } },
    Modal: { defaultProps: { radius: 'lg', overlayProps: { blur: 4, opacity: 0.3 } } },
  },
})

export const designTokens = {
  palette: {
    primary: colimaBlue[7],
    primarySoft: colimaBlue[0],
    accent: colimaTeal[6],
    warning: statusAmber[5],
    success: statusGreen[5],
    danger: statusRed[5],
    slate: neutralSlate,
  },
  typography: {
    heading: 'Space Grotesk',
    body: 'Inter',
  },
  gradients: {
    hero: 'linear-gradient(135deg, #1e476f 0%, #00554f 60%, #c98305 100%)',
  },
}
