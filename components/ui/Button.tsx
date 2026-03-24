type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
};

export default function Button({ children, variant = "primary" }: ButtonProps) {
    const base = "px-6 py-3 rounded-xl font-semibold transition cursor-pointer w-full h-10 flex items-center justify-center";

    const styles = {
    primary: "bg-primary-500 text-white hover:bg-primary-600",
    secondary: "bg-secondary-500 text-primary-900 hover:bg-secondary-600",
    };

    return (
        <button className={`${base} ${styles[variant]}`}>
            {children}
        </button>
    );
}