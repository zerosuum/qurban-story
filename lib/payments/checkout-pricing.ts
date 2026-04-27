import { Prisma } from "@prisma/client";

type PromoLike = {
    isActive: boolean;
    startDate: Date;
    endDate: Date | null;
    discountType: string | null;
    discountValue: Prisma.Decimal | number | string;
};

type CheckoutPricingInput = {
    basePrice: Prisma.Decimal | number | string;
    promos?: PromoLike[];
    now?: Date;
};

function toNumber(value: Prisma.Decimal | number | string) {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        return Number(value);
    }

    return Number(value.toString());
}

function isPromoActiveInPeriod(promo: PromoLike, now: Date) {
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    return (
        promo.isActive &&
        promo.startDate <= now &&
        (promo.endDate === null || promo.endDate >= todayStart)
    );
}

function applyPromo(basePrice: number, promo: PromoLike) {
    const promoValue = toNumber(promo.discountValue);

    if (promo.discountType === "PERCENTAGE") {
        return Math.max(0, basePrice - (basePrice * promoValue) / 100);
    }

    if (
        promo.discountType === "NOMINAL" ||
        promo.discountType === "FIXED_AMOUNT"
    ) {
        return Math.max(0, basePrice - promoValue);
    }

    return basePrice;
}

export function computeCheckoutGrossAmount({
    basePrice,
    promos = [],
    now = new Date(),
}: CheckoutPricingInput) {
    const numericBasePrice = toNumber(basePrice);
    const activePromo = promos.find((promo) => isPromoActiveInPeriod(promo, now));

    const finalPrice = activePromo
        ? applyPromo(numericBasePrice, activePromo)
        : numericBasePrice;

    return Math.max(1, Math.round(finalPrice));
}
