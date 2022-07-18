import { Show } from "@/components/Show";
import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Portal,
    useDisclosure,
    useOutsideClick,
} from "@chakra-ui/react";
import { MutableRefObject, ReactNode } from "react";
import { getRangeStart, useFallbackDates } from "./DateRangePresetPicker";
import { TwoMonthsDateRangeCalendar } from "./TwoMonthsDateRangeCalendar";
import { useCalendarValues } from "./useCalendarValues";

export const CustomDateRangeCalendarButton = ({
    renderTrigger,
    calendarRef,
}: {
    renderTrigger: (props: { onOpen: () => void }) => ReactNode;
    calendarRef: MutableRefObject<HTMLDivElement>;
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { setDates, ...dates } = useCalendarValues();
    const fallbackDates = useFallbackDates();
    const handleClose = () => {
        let { start, end } = dates;
        if (!dates.start) {
            start = fallbackDates.start || getRangeStart("1m");
        }
        if (!dates.end) {
            end = fallbackDates.end || new Date();
        }
        setDates({ start, end });
        onClose();
    };

    useOutsideClick({ ref: calendarRef, handler: handleClose, enabled: isOpen });

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
                    <TwoMonthsDateRangeCalendar
                        renderButton={(dates) => (
                            <Show when={Boolean(dates.start || dates.end)}>
                                <Button
                                    onClick={handleClose}
                                    colorScheme="pink"
                                    size="md"
                                    disabled={!Boolean(dates.start || dates.end)}
                                >
                                    Close
                                </Button>
                            </Show>
                        )}
                    />
                </PopoverContent>
            </Portal>
        </Popover>
    );
};
