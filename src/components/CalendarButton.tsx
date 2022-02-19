import {
    useDisclosure,
    useOutsideClick,
    Box,
    Popover,
    PopoverTrigger,
    Input,
    PopoverContent,
    PopoverBody,
    Button,
} from "@chakra-ui/react";
import {
    Calendar,
    CalendarDate,
    CalendarControls,
    CalendarPrevButton,
    CalendarNextButton,
    CalendarMonths,
    CalendarMonth,
    CalendarMonthName,
    CalendarWeek,
    CalendarDays,
} from "@uselessdev/datepicker";
import { isValid, format } from "date-fns";
import { useState, useRef, ChangeEvent, useEffect } from "react";

const today = new Date();
export const CalendarButton = () => {
    const [date, setDate] = useState<CalendarDate>(today);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const calendarRef = useRef(null);

    const handleSelectDate = (date: CalendarDate) => {
        setDate(date);
        //   setValue(() => (isValid(date) ? format(date, 'MM/dd/yyyy') : ''))
        onClose();
    };

    useOutsideClick({
        ref: calendarRef,
        handler: onClose,
        enabled: isOpen,
    });

    return (
        <Popover placement="auto-start" isOpen={isOpen} onClose={onClose} isLazy>
            <PopoverTrigger>
                <Button fontSize="xl" fontWeight="bold" onClick={onOpen}>
                    {format(date, "dd/MM/yyyy")}
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
                <Calendar value={{ start: date }} onSelectDate={handleSelectDate} singleDateSelection>
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
