import { CustomDay } from "@/components/CalendarButton";
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
import { useCalendarValues } from "./useCalendarValues";

const MONTHS = 2;
export const TwoMonthsDateRangeCalendar = ({ onSelectDates }: { onSelectDates: (dates: CalendarValues) => void }) => {
    const dailyList = useDailyList();
    const { setDates, ...dates } = useCalendarValues();
    const handleSelectDate = (dates: CalendarValues) => {
        console.log(dates);
        setDates(dates);
        if (dates.start && dates.end) {
            onSelectDates(dates);
        }
    };
    const categoryList = useCategoryList();

    return (
        <Calendar value={dates} onSelectDate={handleSelectDate} months={MONTHS} disableFutureDates>
            <Box d="flex" flexDir="column">
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
                    <Button
                        onClick={() => setDates({ start: null, end: null })}
                        colorScheme="pink"
                        size="md"
                        disabled={!Boolean(dates.start || dates.end)}
                    >
                        Reset range
                    </Button>
                </VStack>
            </Box>
        </Calendar>
    );
};
