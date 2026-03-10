import { useState, useEffect, useRef } from "react";
import { LucideChevronDown } from "lucide-react";
import { useCountriesContext } from "../context/CountriesContext";

interface CountryPickerProps {
    value: string;
    onChange: (name: string) => void;
    inputClassName?: string;
    placeholder?: string;
    required?: boolean;
}

const CountryPicker = ({
    value,
    onChange,
    inputClassName = "w-full bg-background-primary border border-border-light rounded-xl px-4 py-3 pr-10 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200",
    placeholder,
    required,
}: CountryPickerProps) => {
    const { countries, isLoading } = useCountriesContext();
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setQuery(value); }, [value]);

    const filtered = countries
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery(value);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [value]);

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={isLoading ? "Loading countries…" : (placeholder ?? "Select country")}
                    className={inputClassName}
                    required={required}
                />
                <LucideChevronDown
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/40 pointer-events-none transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
            </div>
            {open && filtered.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-border-light/60 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                    {filtered.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(c.name);
                                setQuery(c.name);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 ${c.name === value ? "bg-accent/8 text-accent font-medium" : "text-heading hover:bg-accent/5"}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CountryPicker;
