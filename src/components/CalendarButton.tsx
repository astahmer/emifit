import { isDailyTodayAtom } from "@/store";
import {
    Button,
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
    CalendarDays,
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
                                <CalendarDays />
                            </CalendarMonth>
                        </CalendarMonths>
                    </PopoverBody>
                </Calendar>
            </PopoverContent>
        </Popover>
    );
};
