import { StrictMode, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes/route";
import { AuthProvider } from "./context/AuthContext";
import { CountriesProvider } from "./context/CountriesContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryclient } from "./lib/queryclient";

/* eslint-disable react-refresh/only-export-components */
const AppFallback = () => (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-6 text-center text-sm text-gray-600">
        Loading Travel Medicine Advisory...
    </div>
);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
            <HelmetProvider>
        <QueryClientProvider client={queryclient}>
            <AuthProvider>
                <CountriesProvider>
                    <Suspense fallback={<AppFallback />}>
                        <RouterProvider router={router} />
                    </Suspense>
                </CountriesProvider>
            </AuthProvider>
        </QueryClientProvider>
            </HelmetProvider>
    </StrictMode>,
);
