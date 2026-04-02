"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

type DateRangePickerProps = {
    label: string;
    startDate: string;
    endDate: string;
    placeholder?: string;
    onChange: (nextStartDate: string, nextEndDate: string) => void;
};

function parseIsoDate(value: string) {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(value: string) {
    if (!value) {
        return "";
    }

    const parsedDate = parseIsoDate(value);

    if (!parsedDate) {
        return value;
    }

    const day = `${parsedDate.getDate()}`.padStart(2, "0");
    const month = `${parsedDate.getMonth() + 1}`.padStart(2, "0");
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
}

export default function DateRangePicker({
    label,
    startDate,
    endDate,
    placeholder = "Pilih periode",
    onChange,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
    const pickerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fromDate = parseIsoDate(startDate);
        const toDate = parseIsoDate(endDate);

        if (fromDate) {
            setSelectedRange({ from: fromDate, to: toDate ?? undefined });
            return;
        }

        setSelectedRange(undefined);
    }, [startDate, endDate]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleRangeChange = (range: DateRange | undefined) => {
        setSelectedRange(range);

        if (!range?.from) {
            onChange("", "");
            return;
        }

        onChange(toIsoDate(range.from), range.to ? toIsoDate(range.to) : "");
    };

    const handleClear = () => {
        setSelectedRange(undefined);
        onChange("", "");
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-base font-semibold text-neutral-500">{label}</label>
            <div ref={pickerRef} className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-100 px-3 text-left text-sm text-neutral-500 outline-none hover:border-primary-200"
                >
                    <span>
                        {startDate
                            ? `${formatDateDisplay(startDate)}${endDate ? ` - ${formatDateDisplay(endDate)}` : ""}`
                            : placeholder}
                    </span>
                    <span className="text-neutral-400">▾</span>
                </button>

                {startDate && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="mt-1 cursor-pointer text-xs font-semibold text-primary-500 hover:text-primary-600"
                    >
                        Clear
                    </button>
                )}

                {isOpen && (
                    <div className="absolute right-0 z-30 mt-2 w-[320px] rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.16)]">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold text-neutral-500">Pilih Periode</p>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Tutup datepicker"
                                className="cursor-pointer text-base leading-none text-neutral-400 hover:text-neutral-600"
                            >
                                ×
                            </button>
                        </div>

                        <DayPicker
                            mode="range"
                            selected={selectedRange}
                            onSelect={handleRangeChange}
                            numberOfMonths={1}
                            showOutsideDays
                            weekStartsOn={0}
                            className="text-neutral-700"
                            classNames={{
                                month: "w-full",
                                caption: "mb-2 flex items-center justify-between text-sm font-semibold text-neutral-700",
                                caption_label: "text-sm font-semibold text-neutral-700",
                                nav: "ml-auto flex items-center gap-1",
                                button_previous: "inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50",
                                button_next: "inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50",
                                month_grid: "w-full border-collapse",
                                weekdays: "mb-1",
                                weekday: "h-8 text-xs font-semibold text-neutral-400",
                                week: "h-9",
                                day: "h-9 w-9 p-0 text-center",
                                day_button: "h-8 w-8 rounded-md text-xs transition hover:bg-primary-100/35",
                                selected: "!bg-primary-500 hover:!bg-primary-500 [&>button]:!text-white",
                                range_start: "!bg-primary-500 rounded-l-md [&>button]:!text-white",
                                range_end: "!bg-primary-500 rounded-r-md [&>button]:!text-white",
                                range_middle: "!bg-primary-300 [&>button]:!text-white",
                                today: "font-bold text-primary-500",
                                outside: "text-neutral-300",
                            }}
                            modifiersStyles={{
                                selected: { color: "#ffffff" },
                                range_start: { color: "#ffffff" },
                                range_end: { color: "#ffffff" },
                                range_middle: { color: "#ffffff" },
                            }}
                        />

                        <div className="mt-2 text-xs text-neutral-500">
                            {selectedRange?.from
                                ? `Mulai: ${formatDateDisplay(startDate)}${selectedRange.to ? ` | Selesai: ${formatDateDisplay(endDate)}` : ""}`
                                : "Klik tanggal mulai lalu klik tanggal akhir."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
