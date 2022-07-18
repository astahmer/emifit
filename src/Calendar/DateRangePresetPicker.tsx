import { useCalendarValues } from "@/Calendar/useCalendarValues";
import { CheckIcon } from "@chakra-ui/icons";
import { Tag, TagLabel, TagLeftIcon, Wrap, WrapItem } from "@chakra-ui/react";
import { subMonths, subWeeks, subYears } from "date-fns";
import { useRef, useState } from "react";
import { match } from "ts-pattern";
import { CustomDateRangeCalendarButton } from "./CustomDateRangeCalendarButton";

export const DateRangePresetPicker = ({
    rangePresets,
    initialRange,
}: {
    rangePresets?: RangePreset[];
    initialRange?: RangePresetOrCustom;
}) => {
    const { setDates } = useCalendarValues();
    const [activeRange, setActiveRange] = useState<RangePresetOrCustom>(initialRange || rangePresets[0]);

    const rangeContainerRef = useRef<HTMLDivElement>();

    return (
        <Wrap ref={rangeContainerRef}>
            {(rangePresets || baseRangePresets).map((value) => (
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
            <WrapItem>
                <CustomDateRangeCalendarButton
                    calendarRef={rangeContainerRef}
                    renderTrigger={({ onOpen }) => (
                        <Tag
                            colorScheme="pink"
                            variant={"custom" === activeRange ? "solid" : "subtle"}
                            onClick={() => {
                                if (activeRange !== "custom") {
                                    setActiveRange("custom");
                                    setDates({ start: getRangeStart("1m"), end: new Date() });
                                }

                                return onOpen();
                            }}
                        >
                            {"custom" === activeRange ? <TagLeftIcon boxSize="12px" as={CheckIcon} /> : null}
                            <TagLabel>Custom</TagLabel>
                        </Tag>
                    )}
                />
            </WrapItem>
        </Wrap>
    );
};

export const getRangeStart = (preset: RangePreset) => {
    const today = new Date();
    return match(preset)
        .with("1 week", () => subWeeks(today, 1))
        .with("1m", () => subMonths(today, 1))
        .with("3m", () => subMonths(today, 3))
        .with("6m", () => subMonths(today, 6))
        .with("1y", () => subYears(today, 1))
        .exhaustive();
};

export const baseRangePresets = ["1 week", "1m", "3m", "6m", "1y"] as const;
export type RangePresetOrCustom = typeof baseRangePresets[number] | "custom";
export type RangePreset = Exclude<RangePresetOrCustom, "custom">;
