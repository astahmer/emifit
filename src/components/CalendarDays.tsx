import { LiteralUnion } from "@/types";
import { Button, Grid, useMultiStyleConfig, useStyleConfig } from "@chakra-ui/react";
import { CalendarContext, CalendarDate, CalendarMonthStyles, MonthContext } from "@uselessdev/datepicker";
import { eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isSameDay, isWeekend, startOfMonth } from "date-fns";
import * as React from "react";

export function EmiFitCalendarDays({
    getVariant,
    render,
}: { getVariant?: (args: GetVariantArgs) => DayVariant } & Pick<DayProps, "render">) {
    const styles = useMultiStyleConfig("CalendarMonth", {}) as CalendarMonthStyles;
    const {
        dates,
        onSelectDates,
        startSelectedDate,
        endSelectedDate,
        disableDates,
        disableFutureDates,
        disablePastDates,
        disableWeekends,
        highlightToday,
    } = React.useContext(CalendarContext);
    const { month } = React.useContext(MonthContext);

    return (
        <Grid sx={styles.days}>
            {dates[Number(month)].days.map((day, index) => {
                if (!day) {
                    return <span key={`not-a-day-${index}`} />;
                }

                let variant: DayVariant;

                const isSelected =
                    (startSelectedDate && isSameDay(day, startSelectedDate)) ||
                    (endSelectedDate && isSameDay(day, endSelectedDate));

                if (isSelected) {
                    variant = "selected";
                }

                if (
                    (isBefore(day, startOfMonth(dates[Number(month)].startDateOfMonth)) ||
                        isAfter(day, endOfMonth(dates[Number(month)].startDateOfMonth))) &&
                    !isSelected
                ) {
                    variant = "outside";
                }

                if (highlightToday && isSameDay(new Date(), day)) {
                    variant = "today";
                }

                const interval =
                    startSelectedDate &&
                    endSelectedDate &&
                    eachDayOfInterval({
                        start: startSelectedDate,
                        end: endSelectedDate,
                    });

                const isInRange = interval ? interval.some((date) => isSameDay(day, date)) : false;

                if (isInRange && !isSelected) {
                    variant = "range";
                }

                const isDisabled =
                    (disablePastDates &&
                        isBefore(day, disablePastDates instanceof Date ? disablePastDates : new Date())) ||
                    (disableFutureDates &&
                        isAfter(day, disableFutureDates instanceof Date ? disableFutureDates : new Date())) ||
                    (disableWeekends && isWeekend(day)) ||
                    (disableDates && disableDates.some((date) => isSameDay(day, date)));

                const key = format(day, "d-M");
                if (getVariant) {
                    variant = getVariant({ day, index, key, interval, isDisabled, isSelected, isInRange, variant });
                }

                return (
                    <Day
                        variant={variant as Day["variant"]}
                        day={day}
                        key={key}
                        disabled={isDisabled}
                        onSelectDate={onSelectDates}
                        render={render}
                    />
                );
            })}
        </Grid>
    );
}

interface GetVariantArgs {
    day: CalendarDate;
    index: number;
    key: string;
    interval: Date[];
    isDisabled: boolean;
    isSelected: boolean;
    isInRange: boolean;
    variant: DayVariant;
}

type DayVariant = LiteralUnion<"selected" | "range" | "outside" | "today"> | undefined;

type Day = React.PropsWithChildren<{
    day: CalendarDate;
    variant?: "selected" | "range" | "outside" | "today";
    disabled?: boolean;
    onSelectDate: (date: CalendarDate) => void;
}>;

interface DayProps extends Day {
    render?: (args: Day) => React.ReactNode;
}

function Day({ day, variant, disabled, onSelectDate, render }: DayProps) {
    const styles = useStyleConfig("CalendarDay", { variant });
    // console.log({ variant, day })

    return (
        <Button
            aria-label={format(day, "MM-d")}
            onClick={() => onSelectDate(day)}
            sx={styles}
            isDisabled={disabled}
            aria-current={variant === "selected" ? "date" : false}
        >
            {render ? render({ day, variant, disabled, onSelectDate }) : format(day, "d")}
        </Button>
    );
}
