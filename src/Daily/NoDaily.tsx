import { HFlex } from "@/components/HFlex";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { orm } from "@/orm";
import { currentDailyIdAtom, isDailyTodayAtom } from "@/store";
import { useCurrentDailyInvalidate } from "@/orm-hooks";
import { Alert, AlertIcon, Box, Divider, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useMutation } from "react-query";
import { useLastFilledDaily, useLastFilledDailyDate } from "./useLastFilledDailyDate";
import { GoToClosestPreviousDailyEntryButton } from "./GoToClosestPreviousDailyEntryButton";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";

export const NoDaily = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <HFlex h="100%" justifyContent="center">
            {isDailyToday ? <EmptyTodayDaily /> : <EmptyPastDay />}
        </HFlex>
    );
};
const EmptyTodayDaily = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const invalidate = useCurrentDailyInvalidate();

    const createDaily = useMutation(
        (category: string) => {
            const now = new Date();
            return orm.daily.add({
                id,
                category,
                date: now,
                time: now.getTime(),
                exerciseList: [],
                completedList: [],
            });
        },
        { onSuccess: invalidate }
    );
    const lastFilledDaily = useLastFilledDaily();

    return (
        <>
            <Box m="4">
                <Alert status="info" rounded="full" justifyContent="center">
                    <AlertIcon />
                    <Text>No category picked yet !</Text>
                </Alert>
                {lastFilledDaily && (
                    <Text fontSize="xs" textAlign="center" mt="1" opacity="0.6">
                        (Last entry's category was {lastFilledDaily.category} on {lastFilledDaily.id})
                    </Text>
                )}
            </Box>
            <Divider mb="4" />
            <Box alignSelf="center">
                <CategoryRadioPicker onChange={createDaily.mutate} />
            </Box>
        </>
    );
};
const EmptyPastDay = () => {
    const lastFilledDaily = useLastFilledDailyDate();

    return (
        <>
            <Box m="4">
                <Box m="4">
                    <Alert status="warning" rounded="full" justifyContent="center">
                        <AlertIcon />
                        Nothing to see here !
                    </Alert>
                </Box>
            </Box>
            {lastFilledDaily ? (
                <>
                    <Divider mb="4" />
                    <Box alignSelf="center">
                        <GoToClosestPreviousDailyEntryButton />
                    </Box>
                </>
            ) : null}
            <Divider mb="4" />
            <Box alignSelf="center">
                <GoBackToTodayEntryButton />
            </Box>
        </>
    );
};
