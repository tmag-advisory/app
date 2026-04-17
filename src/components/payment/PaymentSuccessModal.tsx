import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LucidePlusCircle, LucideFileText, LucideX, LucideCheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

interface PaymentSuccessData {
    success: boolean;
    credits: number;
    txRef: string;
    timestamp: number;
}

interface PaymentSuccessModalProps {
    onClose: () => void;
}

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export const PaymentSuccessModal = ({ onClose }: PaymentSuccessModalProps) => {
    const navigate = useNavigate();
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        const paymentData = sessionStorage.getItem("paymentSuccess");
        if (paymentData) {
            try {
                const data: PaymentSuccessData = JSON.parse(paymentData);
                setCredits(data.credits);
                sessionStorage.removeItem("paymentSuccess");
            } catch (e) {
                console.error("Failed to parse payment success data", e);
            }
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 pt-10 pb-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-heading hover:bg-background-primary transition-colors duration-200 cursor-pointer"
                >
                    <LucideX className="w-4 h-4" />
                </button>

                {/* Icon */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.15 }}
                    className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5"
                >
                    <LucideCheckCircle className="w-6 h-6 text-accent" />
                </motion.div>

                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.22, ease }}
                    className="text-xl font-serif text-heading text-center mb-6"
                >
                    Credits added
                </motion.h2>

                {/* Credit count */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.32, ease }}
                    className="bg-background-primary rounded-xl py-5 px-6 text-center mb-8"
                >
                    <motion.p
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.45 }}
                        className="text-4xl font-serif text-accent font-medium leading-none"
                    >
                        +{credits}
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.55, ease }}
                        className="text-xs text-muted mt-2"
                    >
                        credits ready to use
                    </motion.p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5, ease }}
                    className="space-y-3"
                >
                    <button
                        onClick={() => { onClose(); navigate("/dashboard/create-plan"); }}
                        className="w-full py-3 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <LucidePlusCircle className="w-4 h-4" />
                        Create a new plan
                    </button>

                    <button
                        onClick={() => { onClose(); navigate("/dashboard/plans"); }}
                        className="w-full py-3 px-5 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        <LucideFileText className="w-4 h-4" />
                        View previous plans
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6, ease }}
                    className="text-center mt-5"
                >
                    <button
                        onClick={onClose}
                        className="text-sm text-muted hover:text-heading transition-colors duration-200 cursor-pointer"
                    >
                        Maybe later
                    </button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

// Hook to manage payment success modal state
export const usePaymentSuccessModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [hasShownModal, setHasShownModal] = useState(false);
    const { refreshProfile } = useAuth();

    useEffect(() => {
        const checkPaymentSuccess = () => {
            const paymentData = sessionStorage.getItem("paymentSuccess");
            if (paymentData && !hasShownModal) {
                try {
                    const data: PaymentSuccessData = JSON.parse(paymentData);
                    if (data.success && Date.now() - data.timestamp < 5 * 60 * 1000) {
                        setShowModal(true);
                        setHasShownModal(true);
                        refreshProfile();
                    }
                } catch (e) {
                    sessionStorage.removeItem("paymentSuccess");
                }
            }
        };

        const timer = setTimeout(checkPaymentSuccess, 100);
        return () => clearTimeout(timer);
    }, [hasShownModal, refreshProfile]);

    const closeModal = () => {
        setShowModal(false);
        sessionStorage.removeItem("paymentSuccess");
    };

    return { showModal, closeModal };
};
