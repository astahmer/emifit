import { showSkeletonsAtom } from "@/store";
import { useDailyQuery } from "@/orm-hooks";
import { Divider, Flex, Skeleton } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { DailyExerciseTaskListSkeleton } from "./DailyExerciseTaskListSkeleton";
import { NoDaily } from "./NoDaily";
import { WithDaily } from "./WithDaily";

export const DailyEntry = () => {
    const query = useDailyQuery();
    const daily = query.data;
    const showSkeletons = useAtomValue(showSkeletonsAtom);

    if (showSkeletons || query.isLoading) {
        return (
            <Flex as="section" flexDirection="column" h="100%" minH={0}>
                <Flex justifyContent="space-around">
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                </Flex>
                <Divider mt="4" />
                <DailyExerciseTaskListSkeleton />
            </Flex>
        );
    }

    return (
        <Flex as="section" id="HomeBody" flexDirection="column" h="100%" minH={0}>
            {daily ? <WithDaily /> : <NoDaily />}
        </Flex>
    );
};
