import { createContext, useState, useMemo, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: "light" });

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem("theme_mode") || "light");

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
            main: mode === "light" ? "#1e40af" : "#60a5fa", // Rich royal blue
            light: "#3b82f6",
            dark: "#1e3a8a",
          },
          secondary: {
            main: mode === "light" ? "#0f766e" : "#2dd4bf", // Deep teal
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
            default: mode === "light" ? "#f8fafc" : "#0f172a", // Sleek modern slate backgrounds
            paper: mode === "light" ? "#ffffff" : "#1e293b",
          },
          text: {
            primary: mode === "light" ? "#0f172a" : "#f8fafc",
            secondary: mode === "light" ? "#475569" : "#94a3b8",
          },
        },
        typography: {
          fontFamily: "'Outfit', 'Inter', 'Poppins', sans-serif", // Clean premium look
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
          borderRadius: 16, // Beautiful smooth rounded corners
        },
        shadows: [
          "none",
          "0px 1px 3px rgba(0, 0, 0, 0.05)",
          "0px 2px 8px rgba(0, 0, 0, 0.06)",
          "0px 4px 12px rgba(0, 0, 0, 0.07)",
          "0px 8px 24px rgba(0, 0, 0, 0.08)",
          "0px 12px 32px rgba(0, 0, 0, 0.09)",
          ...Array(19).fill("none"), // fill remaining shadows to satisfy MUI's length requirement
        ],
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: "8px 20px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0px)",
                },
              },
              containedPrimary: {
                background: mode === "light" ? "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" : undefined,
                color: "#ffffff",
              },
              containedSecondary: {
                background: mode === "light" ? "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)" : undefined,
                color: "#ffffff",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: mode === "light" ? "1px solid #f1f5f9" : "1px solid #334155",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.03)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.03)",
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                "& .MuiTableCell-head": {
                  fontWeight: 700,
                  backgroundColor: mode === "light" ? "#f8fafc" : "#1e293b",
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
                  borderRadius: 12,
                  transition: "all 0.2s ease",
                  backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
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
