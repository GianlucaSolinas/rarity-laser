import { createTheme } from '@mui/material';
import { grey, orange } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: { main: orange[700] },
    secondary: { main: grey[500] },
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
