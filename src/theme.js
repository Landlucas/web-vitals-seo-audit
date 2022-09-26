import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    background: {
      main: "#fff",
      secondary: "#f8f9fa",
    },
    text: {
      fail: "#e53935",
      average: "#fb8c00",
      pass: "#18b663",
    },
  },
  typography: {
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
})

export default theme
