import { CalendarButton } from "@/components/CalendarButton";
import { DailyEntry } from "@/Daily/DailyEntry";
import { currentDateAtom } from "@/store";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { addDays, isFuture } from "date-fns";
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
        <Flex as="section" id="HomeHeader" p="4" justifyContent="space-between" alignItems="center">
            <IconButton
                variant="unstyled"
                aria-label="Prev day"
                icon={<ChevronLeftIcon fontSize="32px" />}
                onClick={() => setDate((current) => addDays(current, -1))}
            />
            <CalendarButton selectedDate={currentDate} onChange={setDate} />
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
