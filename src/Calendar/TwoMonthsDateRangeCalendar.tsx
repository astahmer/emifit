import { CustomDay } from "@/Calendar/CalendarButton";
import { VFlex } from "@/components/VFlex";
import { Show } from "@/components/Show";
import { useCategoryList, useDailyList } from "@/orm-hooks";
import { Box, Button, VStack } from "@chakra-ui/react";
import {
    Calendar,
    CalendarControls,
    CalendarDays,
    CalendarMonth,
    CalendarMonthName,
    CalendarMonths,
    CalendarNextButton,
    CalendarPrevButton,
    CalendarValues,
    CalendarWeek,
} from "@uselessdev/datepicker";
import { ReactNode } from "react";
import { useFallbackDates } from "./DateRangePresetPicker";
import { useCalendarValues } from "./useCalendarValues";

const MONTHS = 2;
export const TwoMonthsDateRangeCalendar = ({
    renderButton,
}: {
    renderButton: (dates: CalendarValues) => ReactNode;
}) => {
    const dailyList = useDailyList();
    const { setDates, ...dates } = useCalendarValues();

    const categoryList = useCategoryList();
    const fallbackDates = useFallbackDates();

    return (
        <Calendar
            value={dates}
            onSelectDate={(dates) => setDates(dates as CalendarValues)}
            months={MONTHS}
            disableFutureDates
        >
            <VFlex>
                <Box position="relative">
                    <CalendarControls>
                        <CalendarPrevButton />
                        <CalendarNextButton />
                    </CalendarControls>

                    <CalendarMonths gridTemplate="1fr 1fr / 1fr">
                        {[...Array(MONTHS).keys()].map((month) => (
                            <CalendarMonth month={month} key={month}>
                                <CalendarMonthName />
                                <CalendarWeek />
                                <CalendarDays>
                                    <CustomDay {...{ dailyList, categoryList }} />
                                </CalendarDays>
                            </CalendarMonth>
                        ))}
                    </CalendarMonths>
                </Box>
                <VStack spacing={4} bgColor="gray.50" p={4} alignItems="stretch" borderEndRadius="md" flex={1}>
                    <Show when={Boolean(dates.start || dates.end)}>
                        <Button
                            onClick={() => setDates(fallbackDates || { start: null, end: null })}
                            colorScheme="pink"
                            size="md"
                            disabled={!Boolean(dates.start || dates.end)}
                            variant="outline"
                        >
                            Reset range
                        </Button>
                    </Show>
                    {renderButton(dates)}
                </VStack>
            </VFlex>
        </Calendar>
    );
};
