"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

type DateFieldWithPickerProps = {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
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

export default function DateFieldWithPicker({
    value,
    onChange,
    placeholder = "dd/mm/yyyy",
}: DateFieldWithPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const pickerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const date = parseIsoDate(value);
        setSelectedDate(date ?? undefined);
    }, [value]);

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

    const handleDateChange = (date: Date | undefined) => {
        setSelectedDate(date);

        if (!date) {
            onChange("");
            return;
        }

        onChange(toIsoDate(date));
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedDate(undefined);
        onChange("");
    };

    return (
        <div ref={pickerRef} className="relative inline-flex">
            <div className="inline-flex h-9 w-fit items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2">
                <span className="text-neutral-500" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4" />
                        <path d="M8 3v4" />
                        <path d="M3 11h18" />
                    </svg>
                </span>

                <input
                    type="text"
                    value={value ? formatDateDisplay(value) : ""}
                    placeholder={placeholder}
                    readOnly
                    className="w-[87px] border-none bg-transparent p-0 text-xs leading-none text-neutral-500 outline-none placeholder:text-xs placeholder:text-neutral-300 cursor-pointer"
                />

                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="cursor-pointer text-neutral-400 hover:text-neutral-600 ml-1"
                    aria-label="Buka datepicker"
                >
                    ▾
                </button>
            </div>

            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-0 right-0 text-xs font-semibold text-primary-500 hover:text-primary-600 mt-10"
                >
                    Clear
                </button>
            )}

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 z-30 w-[320px] rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_8px_28px_-6px_rgba(24,39,75,0.16)]">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-neutral-500">Pilih Tanggal</p>
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
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
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
                            today: "font-bold text-primary-500",
                            outside: "text-neutral-300",
                        }}
                        modifiersStyles={{
                            selected: { color: "#ffffff" },
                        }}
                    />

                    <div className="mt-2 text-xs text-neutral-500">
                        {selectedDate
                            ? `Dipilih: ${formatDateDisplay(value)}`
                            : "Klik tanggal untuk memilih."}
                    </div>
                </div>
            )}
        </div>
    );
}
