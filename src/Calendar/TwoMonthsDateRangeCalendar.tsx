import { CustomDay } from "@/Calendar/CalendarButton";
import { VFlex } from "@/components/VFlex";
import { useCategoryList, useDailyList } from "@/orm-hooks";
import { Box, VStack } from "@chakra-ui/react";
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
                    {renderButton(dates)}
                </VStack>
            </VFlex>
        </Calendar>
    );
};
