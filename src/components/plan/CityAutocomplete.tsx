import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { LucideMapPin } from "lucide-react";

interface CityAutocompleteProps {
    value: string;
    onChange: (city: string) => void;
    countryCode?: string;
    placeholder?: string;
    className?: string;
    withIcon?: boolean;
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

let placesPromise: Promise<google.maps.PlacesLibrary> | null = null;
let optionsConfigured = false;

function loadPlaces(): Promise<google.maps.PlacesLibrary> {
    if (!apiKey) {
        return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY not set"));
    }
    if (!optionsConfigured) {
        setOptions({ key: apiKey, v: "weekly" });
        optionsConfigured = true;
    }
    if (!placesPromise) {
        placesPromise = importLibrary("places");
    }
    return placesPromise;
}

interface Prediction {
    placeId: string;
    primary: string;
    secondary: string;
    full: string;
}

const CityAutocomplete = ({
    value,
    onChange,
    countryCode,
    placeholder = "e.g. Paris",
    className,
    withIcon,
}: CityAutocompleteProps) => {
    const [query, setQuery] = useState(value);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [open, setOpen] = useState(false);
    const [ready, setReady] = useState(false);
    const placesRef = useRef<google.maps.PlacesLibrary | null>(null);
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const requestSeqRef = useRef(0);

    useEffect(() => { setQuery(value); }, [value]);

    useEffect(() => {
        let cancelled = false;
        loadPlaces()
            .then((places) => {
                if (cancelled) return;
                placesRef.current = places;
                sessionTokenRef.current = new places.AutocompleteSessionToken();
                setReady(true);
            })
            .catch(() => {
                setReady(false);
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!ready || !placesRef.current || !query.trim()) {
            setPredictions([]);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const seq = ++requestSeqRef.current;
            const places = placesRef.current!;
            const req: google.maps.places.AutocompleteRequest = {
                input: query,
                includedPrimaryTypes: ["locality", "administrative_area_level_3", "sublocality"],
                sessionToken: sessionTokenRef.current ?? undefined,
            };
            if (countryCode) {
                req.includedRegionCodes = [countryCode.toLowerCase()];
            }
            places.AutocompleteSuggestion.fetchAutocompleteSuggestions(req)
                .then(({ suggestions }) => {
                    if (seq !== requestSeqRef.current) return;
                    const mapped: Prediction[] = suggestions
                        .map((s) => s.placePrediction)
                        .filter((p): p is google.maps.places.PlacePrediction => !!p)
                        .map((p) => ({
                            placeId: p.placeId,
                            primary: p.mainText?.text ?? p.text.text,
                            secondary: p.secondaryText?.text ?? "",
                            full: p.text.text,
                        }));
                    setPredictions(mapped);
                })
                .catch(() => {
                    if (seq !== requestSeqRef.current) return;
                    setPredictions([]);
                });
        }, 250);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, countryCode, ready]);

    const disabled = !countryCode;
    const inputCls = className ?? "w-full bg-white border border-border-light rounded-xl px-4 py-3.5 text-[15px] font-medium text-heading placeholder:text-muted/55 outline-none focus:border-accent transition-colors";

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                {withIcon && (
                    <LucideMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                )}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={disabled ? "Select country first" : placeholder}
                    disabled={disabled}
                    className={`${inputCls} ${withIcon ? "pl-10" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                />
            </div>
            {open && predictions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-border-light/60 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                    {predictions.map((p) => (
                        <button
                            key={p.placeId}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setQuery(p.primary);
                                onChange(p.primary);
                                setOpen(false);
                                if (placesRef.current) {
                                    sessionTokenRef.current = new placesRef.current.AutocompleteSessionToken();
                                }
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 text-heading hover:bg-accent/5"
                        >
                            <span className="font-medium">{p.primary}</span>
                            {p.secondary && (
                                <span className="text-muted text-xs ml-1">
                                    {p.secondary}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CityAutocomplete;
