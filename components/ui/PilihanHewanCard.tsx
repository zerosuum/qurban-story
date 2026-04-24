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
        <div className="w-full max-w-70 rounded-lg bg-white p-6 shadow-md">
            <div className="relative mx-auto aspect-square w-full max-w-58 overflow-hidden rounded-lg bg-neutral-100">
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
            <div className="mt-3 flex flex-col items-center gap-2 text-center">
                <h3 className=" text-[16px] font-semibold text-neutral-900">{name}</h3>
                <p className="text-primary-600 text-lg font-bold">{price}</p>
                <p className="text-primary-900 text-[16px]">{weight}</p>
            </div>
            <Link href={href || "#"} className="mt-4 block w-full">
                <Button variant="primary" className="w-full">
                    Lihat Detail
                </Button>
            </Link>
        </div>
    );
}