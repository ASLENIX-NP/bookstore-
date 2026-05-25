import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,

          style: {
            background: "#111827",
            color: "#fff",
            borderRadius: "16px",
            padding: "14px 18px",
            fontWeight: "700",
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <App />
    </>
  </StrictMode>
);