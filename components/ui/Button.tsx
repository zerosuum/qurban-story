type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
};

export default function Button({ children, variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
    const base = "px-6 py-3 rounded-xl font-semibold transition cursor-pointer w-fit h-10 flex items-center justify-center";

    const styles = {
    primary: "bg-primary-500 text-white hover:bg-primary-600",
    secondary: "bg-secondary-500 text-primary-900 hover:bg-secondary-600",
    };

    return (
        <button type={type} className={`${base} ${styles[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}