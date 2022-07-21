import { VFlex } from "@/components/VFlex";
import { displayDate, printDate } from "@/functions/utils";
import { useCategoryList, useCategoryQuery, useDailyList } from "@/orm-hooks";
import { Category, Daily } from "@/orm-types";
import { isDailyTodayAtom } from "@/store";
import {
    Button,
    Circle,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
    useDisclosure,
    useOutsideClick,
} from "@chakra-ui/react";
import {
    Calendar,
    CalendarControls,
    CalendarDate,
    CalendarDay,
    CalendarDays,
    CalendarMonth,
    CalendarMonthName,
    CalendarMonths,
    CalendarNextButton,
    CalendarPrevButton,
    CalendarWeek,
    useCalendarDay,
} from "@uselessdev/datepicker";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { ComponentProps, useRef } from "react";

export const CalendarButton = ({
    selectedDate,
    onChange,
}: {
    selectedDate: CalendarDate;
    onChange: (update: CalendarDate) => void;
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const calendarRef = useRef(null);

    const handleSelectDate = (date: CalendarDate) => {
        onChange(date);
        onClose();
    };

    useOutsideClick({ ref: calendarRef, handler: onClose, enabled: isOpen });

    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const dailyList = useDailyList();
    const categoryList = useCategoryList();

    return (
        <Popover placement="auto-start" isOpen={isOpen} onClose={onClose} isLazy>
            <PopoverTrigger>
                <Button
                    fontSize="xl"
                    fontWeight="bold"
                    onClick={onOpen}
                    colorScheme={isDailyToday ? "pink" : undefined}
                >
                    {displayDate(selectedDate)}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                p={0}
                w="min-content"
                border="none"
                outline="none"
                _focus={{ boxShadow: "none" }}
                ref={calendarRef}
            >
                <Calendar
                    value={{ start: selectedDate }}
                    onSelectDate={handleSelectDate}
                    singleDateSelection
                    disableFutureDates
                    highlightToday
                    weekStartsOn={1}
                >
                    <PopoverBody p={0}>
                        <CalendarControls>
                            <CalendarPrevButton />
                            <CalendarNextButton />
                        </CalendarControls>

                        <CalendarMonths>
                            <CalendarMonth>
                                <CalendarMonthName />
                                <CalendarWeek />
                                <CalendarDays>
                                    <CustomDay {...{ dailyList, categoryList }} />
                                </CalendarDays>
                            </CalendarMonth>
                        </CalendarMonths>
                    </PopoverBody>
                </Calendar>
            </PopoverContent>
        </Popover>
    );
};

export function DailyCalendarDay({
    day,
    dailyList,
}: {
    day: CalendarDate;
    dailyList: Daily[];
    categoryList: Category[];
}) {
    const calendarDay = useCalendarDay();
    const daily = dailyList.find((d) => d.id === printDate(day));
    const hasSomeExerciseThatDay = daily?.exerciseList?.length;

    const catQuery = useCategoryQuery(daily?.category);
    const bgColor = catQuery?.data?.color || "pink.300";

    if (!hasSomeExerciseThatDay) return <>{format(day, "d")}</>;

    return (
        <VFlex alignItems="center">
            <Text color={!(calendarDay.isInRange || calendarDay.isSelected) ? bgColor : undefined}>
                {format(day, "d")}
            </Text>
            <Circle size="4px" bgColor={bgColor} />
        </VFlex>
    );
}

export function CustomDay({
    dailyList,
    categoryList,
}: Pick<ComponentProps<typeof DailyCalendarDay>, "dailyList" | "categoryList">) {
    const { day } = useCalendarDay();

    return (
        <CalendarDay>
            <DailyCalendarDay day={day} dailyList={dailyList} categoryList={categoryList} />
        </CalendarDay>
    );
}
