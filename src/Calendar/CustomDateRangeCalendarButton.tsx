import { Popover, PopoverContent, PopoverTrigger, Portal, useDisclosure, useOutsideClick } from "@chakra-ui/react";
import { MutableRefObject, ReactNode } from "react";
import { TwoMonthsDateRangeCalendar } from "./TwoMonthsDateRangeCalendar";

export const CustomDateRangeCalendarButton = ({
    renderTrigger,
    calendarRef,
}: {
    renderTrigger: (props: { onOpen: () => void }) => ReactNode;
    calendarRef: MutableRefObject<HTMLDivElement>;
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    useOutsideClick({ ref: calendarRef, handler: onClose, enabled: isOpen });

    return (
        <Popover placement="auto-start" isOpen={isOpen}>
            <PopoverTrigger>{renderTrigger({ onOpen })}</PopoverTrigger>
            <Portal>
                <PopoverContent
                    p={0}
                    w="min-content"
                    border="none"
                    outline="none"
                    _focus={{ boxShadow: "none" }}
                    ref={calendarRef}
                >
                    <TwoMonthsDateRangeCalendar onSelectDates={onClose} />
                </PopoverContent>
            </Portal>
        </Popover>
    );
};
