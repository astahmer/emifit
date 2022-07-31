import { useCalendarValues } from "@/Calendar/useCalendarValues";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { CheckIcon } from "@chakra-ui/icons";
import { Tag, TagLabel, TagLeftIcon, Wrap, WrapItem } from "@chakra-ui/react";
import { getClosestNbIn } from "pastable";
import { CalendarDate, CalendarValues } from "@uselessdev/datepicker";
import { subMonths, subWeeks, subYears, closestIndexTo, differenceInDays } from "date-fns";
import { useRef, useState } from "react";
import { match } from "ts-pattern";
import { CustomDateRangeCalendarButton } from "./CustomDateRangeCalendarButton";

export const DateRangePresetPicker = ({
    rangePresets,
    withCustomBtn,
}: {
    rangePresets?: RangePresetOrCustom[];
    withCustomBtn?: boolean;
}) => {
    const { setDates, ...dates } = useCalendarValues();

    const presets = Array.from(rangePresets || defaultDateRangePresets);
    const { defaultRange, fallbackDates } = getFallbackDates(dates, presets);
    const [activeRange, setActiveRange] = useState<RangePresetOrCustom>(defaultRange);

    const rangeContainerRef = useRef<HTMLDivElement>();

    return (
        <Wrap ref={rangeContainerRef}>
            {presets.map((value) => (
                <WrapItem key={value}>
                    <Tag
                        colorScheme="pink"
                        variant={value === activeRange ? "solid" : "subtle"}
                        onClick={() => {
                            setActiveRange(value);
                            setDates({ start: getRangeStart(value as RangePreset), end: new Date() });
                        }}
                    >
                        {value === activeRange ? <TagLeftIcon boxSize="12px" as={CheckIcon} /> : null}
                        <TagLabel>{value}</TagLabel>
                    </Tag>
                </WrapItem>
            ))}
            {withCustomBtn && (
                <WrapItem>
                    <FallbackDatesProvider value={fallbackDates}>
                        <CustomDateRangeCalendarButton
                            calendarRef={rangeContainerRef}
                            renderTrigger={({ onOpen }) => (
                                <Tag
                                    colorScheme="pink"
                                    variant={"custom" === activeRange ? "solid" : "subtle"}
                                    onClick={() => {
                                        if (activeRange !== "custom") {
                                            setActiveRange("custom");
                                            setDates(fallbackDates);
                                        }

                                        return onOpen();
                                    }}
                                >
                                    {"custom" === activeRange ? <TagLeftIcon boxSize="12px" as={CheckIcon} /> : null}
                                    <TagLabel>Custom</TagLabel>
                                </Tag>
                            )}
                        />
                    </FallbackDatesProvider>
                </WrapItem>
            )}
        </Wrap>
    );
};

export const [FallbackDatesProvider, useFallbackDates] = createContextWithHook<CalendarValues>("FallbackDates");
export const getFallbackDates = (
    dates: CalendarValues,
    presets: RangePresetOrCustom[] = Array.from(defaultDateRangePresets)
) => {
    const { inferedRange, datesRange } = getInferedDateRangePreset(dates.start);
    const defaultRange = inferedRange || presets[0];

    const fallbackIndex = closestIndexTo(getRangeStart(defaultRange === "custom" ? "1m" : defaultRange), datesRange);
    const fallbackDates = { start: datesRange[fallbackIndex], end: new Date() };

    return { fallbackDates, defaultRange };
};

export const getRangeStart = (preset: RangePreset, from?: Date) => {
    const startDate = from || new Date();
    return match(preset)
        .with("1 week", () => subWeeks(startDate, 1))
        .with("2 weeks", () => subWeeks(startDate, 2))
        .with("1m", () => subMonths(startDate, 1))
        .with("2m", () => subMonths(startDate, 2))
        .with("3m", () => subMonths(startDate, 3))
        .with("4m", () => subMonths(startDate, 4))
        .with("6m", () => subMonths(startDate, 6))
        .with("1y", () => subYears(startDate, 1))
        .with("2y", () => subYears(startDate, 2))
        .exhaustive();
};

export const availableDateRangePresets = ["1 week", "2 weeks", "1m", "2m", "3m", "4m", "6m", "1y", "2y"] as const;

export type RangePreset = typeof availableDateRangePresets[number];
export type RangePresetOrCustom = RangePreset | "custom";
export const defaultDateRangePresets = ["1 week", "1m", "2m", "3m", "6m", "1y"] as RangePreset[];

/** Get infered Range in array of presets from provided start/end dates */
export const getInferedDateRangePreset = (start: CalendarDate, end: CalendarDate = new Date()) => {
    const datesRange = availableDateRangePresets.map((range) => getRangeStart(range));
    const rangeDiffs = datesRange.map((date) => differenceInDays(end, date));

    const inferedRangeDiff = getClosestNbIn(rangeDiffs, Math.abs(differenceInDays(end, start)));
    const inferedRangeIndex = rangeDiffs.findIndex((diff) => diff === inferedRangeDiff);
    const inferedRange = availableDateRangePresets[inferedRangeIndex];

    return { inferedRange, inferedRangeIndex, datesRange, date: datesRange[inferedRangeIndex] };
};
