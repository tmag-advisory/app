import { Link } from "react-router-dom";

interface NavLinkProps {
    href: string;
    children: string;
}

const NavLink = ({ href, children }: NavLinkProps) => {
    return (
        <Link
            to={href}
            className="text-sm text-heading hover:text-muted transition-colors duration-200"
        >
            {children}
        </Link>
    );
};

export default NavLink;
