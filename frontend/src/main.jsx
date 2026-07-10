import React from "react";
import ReactDOM from "react-dom/client";

import { CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import "./styles/global.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ColorModeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ColorModeProvider>
      <CssBaseline />

      <AuthProvider>
        <Toaster position="top-right" />

        <App />

      </AuthProvider>
    </ColorModeProvider>
  </React.StrictMode>
);