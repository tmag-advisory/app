import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: ReactNode;
    icon?: ReactNode;
    link?: string;
}

const Button = ({
    variant = "primary",
    children,
    icon,
    link,
    className = "",
    ...props
}: ButtonProps) => {
    if (variant === "secondary") {
        return (
            <button
                className={`flex relative group duration-100 hover:flex hover:items-center hover:justify-center items-center gap-3 px-5 py-2.5 bg-button-secondary rounded-xl font-semibold text-heading cursor-pointer transition-colors text-sm ${className}`}
                {...props}
            >
                {link ?
                    <>
                        <Link
                            to={link}
                            className="hover:flex hover:items-center hover:justify-center flex items-center"
                        >
                            <span
                                className={cn(
                                    icon ?
                                        "group-hover:opacity-0"
                                    :   "group-hover:font-bold",
                                    "duration-300",
                                )}
                            >
                                {children}
                            </span>
                            {icon && (
                                <span className="flex duration-200 items-center scale-75 group-hover:scale-100 relative left-1 group-hover:translate-x-1/2 group-hover:-left-1/2">
                                    {icon}
                                </span>
                            )}
                        </Link>
                    </>
                :   <>
                        <span
                            className={cn(
                                icon ?
                                    "group-hover:opacity-0"
                                :   "group-hover:font-bold group-hover:italic",
                                "duration-300",
                            )}
                        >
                            {children}
                        </span>
                        {icon && (
                            <span className="flex duration-200 items-center scale-75 group-hover:scale-100 relative left-1 group-hover:translate-x-1/2 group-hover:-left-1/2">
                                {icon}
                            </span>
                        )}
                    </>
                }
            </button>
        );
    }

    return (
        <button
            className={`px-5 py-3 rounded-xl bg-dark text-background-primary font-semibold cursor-pointer hover:bg-darkest transition-colors duration-200 text-sm ${className}`}
            {...props}
        >
            {link ?
                <>
                    <Link to={link}>{children}</Link>
                </>
            :   <>{children}</>}
        </button>
    );
};

export default Button;
