"use client";

type DashboardCardVariant = "blue" | "green" | "yellow" | "red";

type DashboardCardProps = {
    title: string;
    value: string;
    variant?: DashboardCardVariant;
};

const variantClasses: Record<DashboardCardVariant, string> = {
    blue: "bg-[#EBF5FB] border-[#2980B9] text-[#2980B9]",
    green: "bg-[#E9F5EE] border-[#2D6A4F] text-[#2D6A4F]",
    yellow: "bg-[#FFF4E5] border-[#E67E22] text-[#E67E22]",
    red: "bg-[#FCEAEA] border-[#A63A3A] text-[#A63A3A]",
};

export default function DashboardCard({
    title,
    value,
    variant = "blue",
}: DashboardCardProps) {
    return (
        <div
            className={`w-full h-30 rounded-xl p-6 border flex flex-col justify-between ${variantClasses[variant]}`}
        >
            <p className="font-semibold">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}