import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ApputilityComponents/theme-provider.tsx";
import { AppLoader } from "@/components/ApputilityComponents/AppLoader.tsx";
import { ConnectionLost } from "@/components/ApputilityComponents/ConnectionLost";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppLoader />
    <ConnectionLost />
    <BrowserRouter>
      <ThemeProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
