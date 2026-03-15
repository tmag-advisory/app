import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AnimateIn from "../../components/animations/AnimateIn";
import { useVerifyEmail, useResendVerificationEmail } from "../../api/hooks";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { LucideLoader } from "lucide-react";

const EmailVerification = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") ?? "";

    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyEmail = useVerifyEmail();
    const resend = useResendVerificationEmail();

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...digits];
        newDigits[index] = value.slice(-1);
        setDigits(newDigits);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pasted[i] || "";
        }
        setDigits(newDigits);
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async () => {
        const code = digits.join("");
        if (code.length !== 6 || !email) return;

        try {
            await verifyEmail.mutateAsync({ email, code });
            toast.success("Email verified!");
            navigate("/onboarding");
        } catch (err) {
            if (err instanceof AxiosError) {
                toast.error(err.response?.data?.error || "Invalid code. Please try again.");
            }
        }
    };

    const handleResend = () => {
        if (!email) return;
        resend.mutate(
            { email },
            {
                onSuccess: () => {
                    toast.success("New code sent! Check your email.");
                    setDigits(["", "", "", "", "", ""]);
                    inputRefs.current[0]?.focus();
                },
                onError: (err) => {
                    if (err instanceof AxiosError) {
                        toast.error(err.response?.data?.error || "Failed to resend code");
                    }
                },
            }
        );
    };

    // Auto-submit when all 6 digits are filled
    useEffect(() => {
        if (digits.every((d) => d !== "")) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [digits]);

    if (!email) {
        return (
            <AnimateIn type="fade" className="text-center">
                <h1 className="text-3xl font-serif text-heading mb-2">Missing email.</h1>
                <p className="text-sm text-body mb-8">
                    Please register or log in to verify your email address.
                </p>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn type="fade">
            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                Verify your email.
            </h1>
            <p className="text-sm text-body mb-8">
                We sent a 6-digit code to{" "}
                <strong className="text-heading">{email}</strong>
            </p>

            <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-semibold text-heading bg-white border-2 border-border-light rounded-xl outline-none focus:border-accent transition-colors duration-200"
                        autoFocus={i === 0}
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={handleVerify}
                disabled={verifyEmail.isPending || digits.some((d) => !d)}
                className="w-full py-3 rounded-xl disabled:bg-gray-500 bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200"
            >
                {verifyEmail.isPending ? (
                    <LucideLoader className="animate-spin block m-auto" scale={0.9} />
                ) : (
                    "Verify & Continue"
                )}
            </button>

            <div className="text-center mt-6">
                <p className="text-sm text-body">
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resend.isPending}
                        className="text-accent font-medium hover:underline cursor-pointer disabled:opacity-50"
                    >
                        {resend.isPending ? "Sending..." : "Resend code"}
                    </button>
                </p>
            </div>
        </AnimateIn>
    );
};

export default EmailVerification;
