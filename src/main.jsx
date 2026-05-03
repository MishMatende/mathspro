import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: "#000",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "#fee2e2",
              color: "#991b1b",
            },
          },
        }}
      />
      <App />
    </BrowserRouter>
  </AuthProvider>,
);
