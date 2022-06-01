import { printDate } from "@/functions/utils";
import { useDailyList } from "@/orm-hooks";
import { isDailyTodayAtom } from "@/store";
import {
    Box,
    Button,
    Circle,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    useDisclosure,
    useOutsideClick,
} from "@chakra-ui/react";
import {
    Calendar,
    CalendarControls,
    CalendarDate,
    CalendarMonth,
    CalendarMonthName,
    CalendarMonths,
    CalendarNextButton,
    CalendarPrevButton,
    CalendarWeek,
} from "@uselessdev/datepicker";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { useRef } from "react";
import { EmiFitCalendarDays } from "./CalendarDays";

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
    const dailyIdList = dailyList.map((daily) => daily.id);

    return (
        <Popover placement="auto-start" isOpen={isOpen} onClose={onClose} isLazy>
            <PopoverTrigger>
                <Button
                    fontSize="xl"
                    fontWeight="bold"
                    onClick={onOpen}
                    colorScheme={isDailyToday ? "pink" : undefined}
                >
                    {format(selectedDate, "dd/MM/yyyy")}
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
                                <EmiFitCalendarDays
                                    getVariant={(args) =>
                                        dailyList.find((d) => d.id === printDate(args.day))?.exerciseList?.length
                                            ? "filled"
                                            : args.variant
                                    }
                                    render={(args) =>
                                        dailyList.find((d) => d.id === printDate(args.day))?.exerciseList?.length ? (
                                            <Box d="flex" flexDirection="column" alignItems="center">
                                                <div>{format(args.day, "d")}</div>
                                                <Circle size="4px" bgColor="pink.300" />
                                                {/* <Box w="100%" h="2px" bgColor="pink.300" /> */}
                                            </Box>
                                        ) : (
                                            format(args.day, "d")
                                        )
                                    }
                                />
                            </CalendarMonth>
                        </CalendarMonths>
                    </PopoverBody>
                </Calendar>
            </PopoverContent>
        </Popover>
    );
};
