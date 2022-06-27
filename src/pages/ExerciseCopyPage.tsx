import { Show } from "@/components/Show";
import { DailyExerciseTaskListSkeleton } from "@/Daily/DailyExerciseTaskListSkeleton";
import { useExerciseQuery } from "@/orm-hooks";
import { Divider, Flex, Skeleton } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { ExerciseAddPage } from "./ExerciseAddPage";

export const ExerciseCopyPage = () => {
    const [searchParams] = useSearchParams();
    const exerciseId = searchParams.get("exoId");
    const exerciseQuery = useExerciseQuery(exerciseId);
    const exercise = exerciseQuery.data;

    return (
        <Show
            when={Boolean(exercise)}
            fallback={
                <Flex id="ExercisePageLayoutSkeleton" as="section" flexDirection="column" h="100%" minH={0}>
                    <Flex justifyContent="space-around">
                        <Skeleton w="100px" h="40px" />
                        <Skeleton w="100px" h="40px" />
                        <Skeleton w="100px" h="40px" />
                    </Flex>
                    <Divider mt="4" />
                    <DailyExerciseTaskListSkeleton />
                </Flex>
            }
        >
            <ExerciseAddPage exercise={exercise} />
        </Show>
    );
};
