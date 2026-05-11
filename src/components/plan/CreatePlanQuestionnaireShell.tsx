import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LucideCheck, LucideCheckCircle, LucideChevronDown, LucideX } from "lucide-react";

export interface PlanQuestionnaireCategory {
    id: number;
    category_key: string;
    category_name: string;
    category_icon: string;
    category_description: string;
    display_order: number;
    is_optional: boolean;
    questions: string;
}

export type PlanQuestionnaireCategoryParsed = PlanQuestionnaireCategory & { parsedQuestions: unknown[] };

interface SidebarProps {
    categories: PlanQuestionnaireCategoryParsed[];
    categoryIndex: number;
    showVerify: boolean;
    progressPercent: number;
}

function SidebarDesktop({ categories, categoryIndex, showVerify, progressPercent }: SidebarProps) {
    return (
        <div className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:border-r lg:border-border-light/60 lg:bg-background-primary lg:pt-20">
            <div className="flex-1 px-5 py-8 overflow-y-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-heading">Progress</span>
                        <span className="text-sm font-bold text-accent">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border-light overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>

                <nav className="space-y-1" aria-label="Section overview (read only)">
                    {categories.map((cat, i) => (
                        <div
                            key={cat.category_key}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl ${
                                showVerify && i === categories.length - 1
                                    ? "bg-accent/10 border border-accent/20"
                                    : i === categoryIndex
                                      ? "bg-accent/10 border border-accent/20"
                                      : i < categoryIndex
                                        ? "text-accent"
                                        : "text-muted"
                            }`}
                        >
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                                    i < categoryIndex
                                        ? "bg-accent text-white"
                                        : i === categoryIndex
                                          ? "bg-heading text-white"
                                          : "bg-border-light text-muted"
                                }`}
                            >
                                {i < categoryIndex ? <LucideCheck className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${i === categoryIndex ? "text-heading" : ""}`}>
                                    {cat.category_name}
                                </p>
                                {i === categoryIndex && (
                                    <p className="text-xs text-muted mt-0.5">
                                        {i < categoryIndex ? "Completed" : "In progress"}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    <div
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl ${
                            showVerify ? "bg-accent/10 border border-accent/20" : "text-muted"
                        }`}
                    >
                        <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                                showVerify ? "bg-heading text-white" : "bg-border-light text-muted"
                            }`}
                        >
                            {showVerify ? <LucideCheck className="w-3.5 h-3.5" /> : "✓"}
                        </div>
                        <p className={`text-sm font-medium ${showVerify ? "text-heading" : ""}`}>Verify & Generate</p>
                    </div>
                </nav>
            </div>
        </div>
    );
}

function SidebarMobile({ categories, categoryIndex, showVerify, progressPercent }: SidebarProps) {
    const [open, setOpen] = useState(false);

    const currentName = showVerify
        ? "Verify & Generate"
        : categories[categoryIndex]?.category_name ?? "Loading…";

    return (
        <div className="lg:hidden px-4 sm:px-6 pt-4 pb-2">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-button-secondary rounded-xl border border-border-light/60 transition-all duration-200 cursor-pointer"
                aria-expanded={open}
                aria-label="Show section overview"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-heading text-white text-xs font-bold">
                        {showVerify ? "✓" : categoryIndex + 1}
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-muted font-medium">
                            {showVerify ? "Final step" : `Section ${categoryIndex + 1} of ${categories.length}`}
                        </p>
                        <p className="text-sm font-semibold text-heading truncate max-w-[180px]">{currentName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-accent tabular-nums">{progressPercent}%</span>
                    <div className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                        <LucideChevronDown className="w-5 h-5 text-muted" />
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 pb-2 space-y-1" aria-label="Section overview (read only)">
                            {categories.map((cat, i) => (
                                <div
                                    key={cat.category_key}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                                        i === categoryIndex
                                            ? "bg-accent/10 border border-accent/20"
                                            : i < categoryIndex
                                              ? "text-accent"
                                              : "text-muted"
                                    }`}
                                >
                                    <div
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                            i < categoryIndex
                                                ? "bg-accent text-white"
                                                : i === categoryIndex
                                                  ? "bg-heading text-white"
                                                  : "bg-border-light text-muted"
                                        }`}
                                    >
                                        {i < categoryIndex ? <LucideCheck className="w-3.5 h-3.5" /> : i + 1}
                                    </div>
                                    <span className={`text-sm font-medium truncate ${i === categoryIndex ? "text-heading" : ""}`}>
                                        {cat.category_name}
                                    </span>
                                    {i < categoryIndex && <LucideCheckCircle className="w-4 h-4 ml-auto text-accent shrink-0" />}
                                </div>
                            ))}

                            <div
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                                    showVerify ? "bg-accent/10 border border-accent/20" : "text-muted"
                                }`}
                            >
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                        showVerify ? "bg-heading text-white" : "bg-border-light text-muted"
                                    }`}
                                >
                                    {showVerify ? <LucideCheck className="w-3.5 h-3.5" /> : "✓"}
                                </div>
                                <span className={`text-sm font-medium ${showVerify ? "text-heading" : ""}`}>Verify & Generate</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export interface PlanQuestionnaireModalShellProps {
    open: boolean;
    onClose: () => void;
    categories: PlanQuestionnaireCategoryParsed[];
    categoryIndex: number;
    showVerify: boolean;
    progressPercent: number;
    brandSlot?: ReactNode;
    headerEndSlot?: ReactNode;
    children: ReactNode;
}

export function PlanQuestionnaireModalShell({
    open,
    onClose,
    categories,
    categoryIndex,
    showVerify,
    progressPercent,
    brandSlot,
    headerEndSlot,
    children,
}: PlanQuestionnaireModalShellProps) {
    const modal = (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="plan-questionnaire-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-background-primary"
                >
                    <div className="sticky top-0 z-[70] px-5 sm:px-8 py-4 flex items-center justify-between border-b border-border-light/60 bg-background-primary/80 backdrop-blur-md">
                        <div className="text-heading tracking-tight text-lg font-serif font-medium select-none">
                            {brandSlot ?? "TMAG"}
                        </div>
                        <div className="flex items-center gap-4">
                            {headerEndSlot ?? (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-light/60 text-muted hover:text-heading hover:border-border transition-colors cursor-pointer"
                                >
                                    <LucideX className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="h-[calc(100vh-73px)] overflow-y-auto">
                        <div className="flex flex-col lg:flex-row min-h-full">
                            <SidebarDesktop
                                categories={categories}
                                categoryIndex={categoryIndex}
                                showVerify={showVerify}
                                progressPercent={progressPercent}
                            />
                            <div className="flex-1">
                                <SidebarMobile
                                    categories={categories}
                                    categoryIndex={categoryIndex}
                                    showVerify={showVerify}
                                    progressPercent={progressPercent}
                                />
                                {children}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modal, document.body);
}
