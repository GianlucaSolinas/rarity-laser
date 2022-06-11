import { createTheme } from '@mui/material';
import { grey, orange } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: { main: orange[700] },
    secondary: { main: grey[500], light: grey[300] },
    background: {
      default: '#282C34',
      paper: '#282C34',
    },
    action: {
      disabled: grey[700],
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*::-webkit-scrollbar': {
          width: '4px',
        },
        '*::-webkit-scrollbar-track': {
          background: grey[200],
        },
        '*::-webkit-scrollbar-thumb': {
          background: orange[800],
          borderRadius: '2px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: 'white !important',
          borderColor: orange[300],
          padding: '8px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&:hover': {
            opacity: 0.7,
          },
        },
        outlined: {
          color: orange[500],
          borderColor: orange[800],
          fontWeight: 'bold',
          fontFamily: 'Lato',
          fontSize: '1rem',
          lineHeight: '1rem',
          borderRadius: '5px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          color: 'white',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          backgroundColor: 'transparent',
          color: orange[700],
          borderColor: orange[700],
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          position: 'absolute',
        },
      },
    },
  },
});

export default theme;
