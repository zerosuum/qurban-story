type KeunggulanProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

export default function KeunggulanCard({ icon, title, description }: KeunggulanProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 flex flex-col items-start text-start gap-2 w-full min-h-64">
            <div className="bg-secondary-100 w-12 h-12 flex items-center justify-center rounded-xl">
                {icon}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm sm:text-base text-neutral-600">{description}</p>
        </div>
    );
}