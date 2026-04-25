type KeunggulanProps = {
    number: string;
    title: string;
    description: string;
};

export default function AlurCard({ number, title, description }: KeunggulanProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 flex flex-col items-start text-start gap-2 w-full max-w-sm min-h-52">
            <div className="bg-secondary-100 w-12 h-12 flex items-center justify-center rounded-xl">
                {number}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm sm:text-base text-neutral-600">{description}</p>
        </div>
    );
}