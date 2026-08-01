import { createContext, useState, useMemo, useContext, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: "light" });

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem("theme_mode") || "light");

  useEffect(() => {
    document.body.style.backgroundColor = mode === "light" ? "#f8fafc" : "#0f172a";
    document.body.style.color = mode === "light" ? "#0f172a" : "#f8fafc";
    if (mode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("theme_mode", nextMode);
          return nextMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "light" ? "#1e40af" : "#60a5fa",
            light: "#3b82f6",
            dark: "#1e3a8a",
          },
          secondary: {
            main: mode === "light" ? "#0f766e" : "#2dd4bf",
          },
          success: {
            main: mode === "light" ? "#10b981" : "#34d399",
          },
          warning: {
            main: mode === "light" ? "#f59e0b" : "#fbbf24",
          },
          error: {
            main: mode === "light" ? "#ef4444" : "#f87171",
          },
          background: {
            default: mode === "light" ? "#f8fafc" : "#0f172a",
            paper: mode === "light" ? "#ffffff" : "#1e293b",
          },
          text: {
            primary: mode === "light" ? "#0f172a" : "#f8fafc",
            secondary: mode === "light" ? "#475569" : "#94a3b8",
          },
          divider: mode === "light" ? "#e2e8f0" : "#334155",
        },
        typography: {
          fontFamily: "'Outfit', 'Inter', 'Poppins', sans-serif",
          h4: {
            fontWeight: 800,
            letterSpacing: "-0.75px",
          },
          h5: {
            fontWeight: 700,
            letterSpacing: "-0.5px",
          },
          h6: {
            fontWeight: 700,
            letterSpacing: "-0.25px",
          },
          subtitle1: {
            fontWeight: 600,
          },
          subtitle2: {
            fontWeight: 600,
          },
          body1: {
            fontSize: "0.975rem",
            lineHeight: 1.6,
          },
          body2: {
            fontSize: "0.875rem",
            lineHeight: 1.6,
          },
          button: {
            textTransform: "none",
            fontWeight: 700,
            letterSpacing: "0.2px",
          },
        },
        shape: {
          borderRadius: 8,
        },
        shadows: [
          "none",
          "0px 1px 3px rgba(0, 0, 0, 0.05)",
          "0px 2px 8px rgba(0, 0, 0, 0.06)",
          "0px 4px 12px rgba(0, 0, 0, 0.07)",
          "0px 8px 24px rgba(0, 0, 0, 0.08)",
          "0px 12px 32px rgba(0, 0, 0, 0.09)",
          ...Array(19).fill("none"),
        ],
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === "light" ? "#f8fafc" : "#0f172a",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                padding: "8px 20px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                },
              },
              containedPrimary: {
                background: mode === "light" ? "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" : "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
                color: "#ffffff",
              },
              containedSecondary: {
                background: mode === "light" ? "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)" : "linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)",
                color: "#ffffff",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                borderColor: mode === "light" ? "#e2e8f0" : "#334155",
                boxShadow: mode === "light" ? "0px 4px 16px rgba(0, 0, 0, 0.04)" : "0px 4px 16px rgba(0, 0, 0, 0.25)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                borderColor: mode === "light" ? "#e2e8f0" : "#334155",
                backgroundImage: "none",
                boxShadow: mode === "light" ? "0px 4px 16px rgba(0, 0, 0, 0.04)" : "0px 4px 16px rgba(0, 0, 0, 0.25)",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                borderColor: mode === "light" ? "#e2e8f0" : "#334155",
                backgroundImage: "none",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
                borderColor: mode === "light" ? "#e2e8f0" : "#334155",
                backgroundImage: "none",
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                "& .MuiTableCell-head": {
                  fontWeight: 700,
                  backgroundColor: mode === "light" ? "#f8fafc" : "#0f172a",
                  color: mode === "light" ? "#475569" : "#94a3b8",
                  borderBottom: "2px solid",
                  borderColor: mode === "light" ? "#e2e8f0" : "#334155",
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                padding: "16px",
                borderColor: mode === "light" ? "#f1f5f9" : "#334155",
                color: mode === "light" ? "#0f172a" : "#f8fafc",
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              fullWidth: true,
              variant: "outlined",
            },
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 6,
                  backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
                  color: mode === "light" ? "#0f172a" : "#f8fafc",
                  "& fieldset": {
                    borderColor: mode === "light" ? "#e2e8f0" : "#334155",
                  },
                  "&:hover fieldset": {
                    borderColor: mode === "light" ? "#cbd5e1" : "#475569",
                  },
                  "&.Mui-focused fieldset": {
                    borderWidth: "2px",
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
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorMode = () => useContext(ColorModeContext);
