import { createContext, useMemo, useState, useContext } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from "@mui/material";

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light"); // default light theme

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // Light theme colors
                primary: { 
                  main: "rgb(33, 44, 101)",
                  light: "rgb(43, 54, 111)",
                  dark: "rgb(25, 35, 85)",
                  contrastText: "#ffffff"
                },
                secondary: { 
                  main: "rgb(43, 54, 111)",
                  light: "rgb(53, 64, 121)",
                  dark: "rgb(35, 45, 95)",
                  contrastText: "#ffffff"
                },
                background: { default: "#f4f6f8", paper: "#fff" },
                text: {
                  primary: "rgba(0, 0, 0, 0.87)",
                  secondary: "rgba(0, 0, 0, 0.6)",
                },
              }
            : {
                // Dark theme colors
                primary: { 
                  main: "rgb(100, 120, 200)",
                  light: "rgb(120, 140, 220)",
                  dark: "rgb(80, 100, 180)",
                  contrastText: "#ffffff"
                },
                secondary: { 
                  main: "rgb(120, 140, 220)",
                  light: "rgb(140, 160, 240)",
                  dark: "rgb(100, 120, 200)",
                  contrastText: "#ffffff"
                },
                background: { default: "#121212", paper: "#1e1e1e" },
                text: {
                  primary: "rgba(255, 255, 255, 0.87)",
                  secondary: "rgba(255, 255, 255, 0.6)",
                },
              }),
        },
        components: {
          // Override all MUI icons to use primary color
          MuiSvgIcon: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
              },
            },
          },
          // Override all MUI buttons to use primary color
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: mode === 'light' 
                    ? 'rgba(33, 44, 101, 0.1)' 
                    : 'rgba(100, 120, 200, 0.1)',
                },
                // Ensure button icons inherit proper color
                '& .MuiSvgIcon-root': {
                  color: 'inherit',
                },
              },
              contained: {
                backgroundColor: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                color: 'white',
                '&:hover': {
                  backgroundColor: mode === 'light' ? 'rgb(43, 54, 111)' : 'rgb(120, 140, 220)',
                },
                // Ensure contained button icons are white
                '& .MuiSvgIcon-root': {
                  color: 'white !important',
                },
              },
              outlined: {
                borderColor: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                color: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                '&:hover': {
                  backgroundColor: mode === 'light' 
                    ? 'rgba(33, 44, 101, 0.1)' 
                    : 'rgba(100, 120, 200, 0.1)',
                },
                // Ensure outlined button icons match text color
                '& .MuiSvgIcon-root': {
                  color: mode === 'light' ? 'rgb(33, 44, 101) !important' : 'rgb(100, 120, 200) !important',
                },
              },
              text: {
                color: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                '&:hover': {
                  backgroundColor: mode === 'light' 
                    ? 'rgba(33, 44, 101, 0.1)' 
                    : 'rgba(100, 120, 200, 0.1)',
                },
                // Ensure text button icons match text color
                '& .MuiSvgIcon-root': {
                  color: mode === 'light' ? 'rgb(33, 44, 101) !important' : 'rgb(100, 120, 200) !important',
                },
              },
            },
          },
          // Override IconButton to use primary color
          MuiIconButton: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                '&:hover': {
                  backgroundColor: mode === 'light' 
                    ? 'rgba(33, 44, 101, 0.1)' 
                    : 'rgba(100, 120, 200, 0.1)',
                },
                // Ensure IconButton icons are visible
                '& .MuiSvgIcon-root': {
                  color: 'inherit !important',
                },
              },
            },
          },
          // Override Chip component
          MuiChip: {
            styleOverrides: {
              root: {
                '&.MuiChip-colorPrimary': {
                  backgroundColor: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                  color: 'white',
                },
              },
            },
          },
          // Override Link component
          MuiLink: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                '&:hover': {
                  color: mode === 'light' ? 'rgb(43, 54, 111)' : 'rgb(120, 140, 220)',
                },
                // Ensure link icons are visible
                '& .MuiSvgIcon-root': {
                  color: 'inherit !important',
                },
              },
            },
          },
          // Override ListItemButton for sidebar
          MuiListItemButton: {
            styleOverrides: {
              root: {
                '& .MuiSvgIcon-root': {
                  color: 'inherit !important',
                },
              },
            },
          },
          // Override MenuItem
          MuiMenuItem: {
            styleOverrides: {
              root: {
                '& .MuiSvgIcon-root': {
                  color: 'inherit !important',
                },
              },
            },
          },
          // Override Select component to ensure proper borders
          MuiSelect: {
            styleOverrides: {
              root: {
                '&.MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                    borderWidth: 2,
                  },
                },
              },
            },
          },
          // Override FormControl to ensure proper styling
          MuiFormControl: {
            styleOverrides: {
              root: {
                '&.MuiFormControl-root': {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: mode === 'light' ? 'rgb(33, 44, 101)' : 'rgb(100, 120, 200)',
                      borderWidth: 2,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
