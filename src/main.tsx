import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/route";
import { AuthProvider } from "./context/AuthContext";
import { CountriesProvider } from "./context/CountriesContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryclient } from "./lib/queryclient";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryclient}>
            <AuthProvider>
                <CountriesProvider>
                    <RouterProvider router={router} />
                </CountriesProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
);
