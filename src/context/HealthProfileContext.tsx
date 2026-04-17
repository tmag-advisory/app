import { createContext, useContext, useState, type ReactNode } from "react";

export interface HealthProfileFormData {
    conditions: string;
    medications: string;
    allergies: string;
    blood_type: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
}

const defaultData: HealthProfileFormData = {
    conditions: "",
    medications: "",
    allergies: "",
    blood_type: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
};

interface HealthProfileContextValue {
    formData: HealthProfileFormData;
    setField: (field: keyof HealthProfileFormData, value: string) => void;
    reset: () => void;
}

const HealthProfileContext = createContext<HealthProfileContextValue | null>(null);

export function HealthProfileProvider({ children }: { children: ReactNode }) {
    const [formData, setFormData] = useState<HealthProfileFormData>(defaultData);

    const setField = (field: keyof HealthProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const reset = () => setFormData(defaultData);

    return (
        <HealthProfileContext.Provider value={{ formData, setField, reset }}>
            {children}
        </HealthProfileContext.Provider>
    );
}

export function useHealthProfile(): HealthProfileContextValue {
    const ctx = useContext(HealthProfileContext);
    if (!ctx) throw new Error("useHealthProfile must be used within <HealthProfileProvider>");
    return ctx;
}
