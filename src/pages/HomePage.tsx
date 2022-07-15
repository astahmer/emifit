import { CalendarButton } from "@/Calendar/CalendarButton";
import { DailyEntry } from "@/Daily/DailyEntry";
import { currentDateAtom } from "@/store";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { addDays, format, isFuture } from "date-fns";
import { useAtom } from "jotai";
import { Outlet } from "react-router-dom";

export const HomePage = () => {
    return (
        <>
            <Header />
            <DailyEntry />
        </>
    );
};

export const HomePageLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
        </>
    );
};

const Header = () => {
    const [currentDate, setDate] = useAtom(currentDateAtom);
    const isNextDayInFuture = isFuture(addDays(currentDate, 1));

    return (
        <Flex as="section" id="HomeHeader" p="4" justifyContent="space-between" alignItems="center" mt="4">
            <IconButton
                variant="unstyled"
                aria-label="Prev day"
                icon={<ChevronLeftIcon fontSize="32px" />}
                onClick={() => setDate((current) => addDays(current, -1))}
            />
            <Box d="flex-column" pos="relative">
                <Box
                    pos="absolute"
                    bottom="100%"
                    mb="1"
                    left="0"
                    right="0"
                    textAlign="center"
                    fontWeight="bold"
                    color="pink.300"
                >
                    {format(currentDate, "EEEE")}
                </Box>
                <CalendarButton selectedDate={currentDate} onChange={setDate} />
            </Box>
            <IconButton
                variant="unstyled"
                aria-label="Next day"
                icon={<ChevronRightIcon fontSize="32px" />}
                isDisabled={isNextDayInFuture}
                onClick={() => setDate((current) => addDays(current, 1))}
            />
        </Flex>
    );
};
