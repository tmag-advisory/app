import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { countriesApi } from "../api/api";
import type { CountryResponse } from "../api/types";

// ─── Context ─────────────────────────────────────────────────

interface CountriesContextValue {
    countries: CountryResponse[];
    isLoading: boolean;
}

const CountriesContext = createContext<CountriesContextValue>({
    countries: [],
    isLoading: false,
});

// ─── Provider ─────────────────────────────────────────────────
// Fetches all countries once on mount. React Query's global staleTime
// (5 min) ensures the list is reused from cache for the entire session.

export function CountriesProvider({ children }: { children: ReactNode }) {
    const { data = [], isLoading } = useQuery<CountryResponse[]>({
        queryKey: ["countries", "all"],
        queryFn: () => countriesApi.listAll(),
    });

    return (
        <CountriesContext.Provider value={{ countries: data, isLoading }}>
            {children}
        </CountriesContext.Provider>
    );
}

export const useCountriesContext = () => useContext(CountriesContext);
