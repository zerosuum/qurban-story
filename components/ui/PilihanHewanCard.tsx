import Image from "next/image";
import Link from "next/link";
import Button from "./Button";

type PilihanHewanCardProps = {
    image: string;
    name: string;
    price: string;
    weight: string;
    href?: string;
};

export default function PilihanHewanCard({ image, name, price, weight, href }: PilihanHewanCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center w-70 h-108">
            <Image src={image} alt={name} width={232} height={232} className="object-cover rounded-lg" />
            <div className="mt-2 flex flex-col items-center gap-2">
                <h3 className=" text-[16px] font-semibold text-neutral-900">{name}</h3>
                <p className="text-primary-600 text-lg font-bold">{price}</p>
                <p className="text-primary-900 text-[16px]">{weight}</p>
            </div>
            <Link href={href || "#"} className="mt-4 w-58">
                <Button variant="primary" className="w-full">
                    Lihat Detail
                </Button>
            </Link>
        </div>
    );
}