import { useEffect, useRef, type ReactNode } from "react";
import { LucideX } from "lucide-react";
import { cn } from "../../lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    /** Optional id of the element describing the dialog (linked via aria-describedby). */
    describedById?: string;
    children: ReactNode;
    className?: string;
}

const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog: focus is trapped while open and returned to the
 * previously-focused element on close. Escape and backdrop click both close.
 */
export default function Modal({ isOpen, onClose, title, describedById, children, className }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        previouslyFocused.current = document.activeElement as HTMLElement | null;
        const node = dialogRef.current;
        const focusables = node?.querySelectorAll<HTMLElement>(FOCUSABLE);
        (focusables?.[0] ?? node)?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key !== "Tab" || !node) return;
            const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKey, true);
        return () => {
            document.removeEventListener("keydown", handleKey, true);
            previouslyFocused.current?.focus?.();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={describedById}
                tabIndex={-1}
                className={cn(
                    "bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 outline-none",
                    className,
                )}
            >
                <div className="flex items-start justify-between mb-4">
                    <h2 id={titleId} className="text-lg font-serif text-heading">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="text-muted hover:text-heading transition-colors duration-200 cursor-pointer"
                    >
                        <LucideX className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
