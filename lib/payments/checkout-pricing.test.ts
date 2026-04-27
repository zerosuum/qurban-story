import { describe, expect, it } from "bun:test";
import { Prisma } from "@prisma/client";
import { computeCheckoutGrossAmount } from "@/lib/payments/checkout-pricing";

describe("computeCheckoutGrossAmount", () => {
    const now = new Date(2026, 3, 27, 10, 0, 0);

    it("pakai harga diskon saat promo masih aktif", () => {
        const grossAmount = computeCheckoutGrossAmount({
            basePrice: new Prisma.Decimal("5000000"),
            now,
            promos: [
                {
                    isActive: true,
                    discountType: "PERCENTAGE",
                    discountValue: new Prisma.Decimal("10"),
                    startDate: new Date(2026, 3, 20, 0, 0, 0),
                    endDate: new Date(2026, 3, 30, 23, 59, 59),
                },
            ],
        });

        expect(grossAmount).toBe(4500000);
    });

    it("kembali ke harga asli saat promo sudah expired", () => {
        const grossAmount = computeCheckoutGrossAmount({
            basePrice: new Prisma.Decimal("5000000"),
            now,
            promos: [
                {
                    isActive: true,
                    discountType: "PERCENTAGE",
                    discountValue: new Prisma.Decimal("10"),
                    startDate: new Date(2026, 3, 20, 0, 0, 0),
                    endDate: new Date(2026, 3, 26, 23, 59, 59),
                },
            ],
        });

        expect(grossAmount).toBe(5000000);
    });
});
