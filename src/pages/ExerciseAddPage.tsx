import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { orm } from "@/orm";
import { Exercise } from "@/orm-types";
import { routeMap } from "@/routes";
import { currentDailyIdAtom, showSkeletonsAtom } from "@/store";
import { useCurrentDailyInvalidate, useCurrentDailyQuery } from "@/orm-hooks";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, Heading, Skeleton } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { DailyExerciseTaskListSkeleton } from "@/Daily/DailyExerciseTaskListSkeleton";

export const ExerciseAddPage = () => {
    const dailyId = useAtomValue(currentDailyIdAtom);
    const query = useCurrentDailyQuery();
    const daily = query.data;

    const navigate = useNavigate();
    const invalidate = useCurrentDailyInvalidate();
    const addExerciseToDaily = useMutation(
        (exo: Exercise) =>
            orm.daily.upsert(dailyId, (current) => ({
                ...current,
                exerciseList: (current.exerciseList || []).concat(exo.id),
                completedList: (current.completedList || []).concat(exo.id), // Added that since ExerciseCheckbox has been commented out
            })),
        {
            onSuccess: () => {
                invalidate();
                navigate(routeMap.home);
            },
        }
    );

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
        <Box id="CreateExercisePage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">Add daily exercise </Heading>
            <Heading as="h2" size="md">
                {dailyId} - {daily?.category}
            </Heading>
            <Box mt="auto" minH="0">
                {daily && (
                    <CreateExerciseForm
                        category={daily.category}
                        onSubmit={addExerciseToDaily.mutate}
                        renderSubmit={(form) => {
                            const [name, tags] = form.watch(["name", "tags"]);

                            return (
                                Boolean(name && tags.length) && (
                                    <Box p="4" pb="0">
                                        <Divider />
                                        <Box py="4">
                                            <Button
                                                mt="4"
                                                isFullWidth
                                                leftIcon={<CheckIcon />}
                                                colorScheme="pink"
                                                variant="solid"
                                                type="submit"
                                                size="lg"
                                            >
                                                Create
                                            </Button>
                                        </Box>
                                    </Box>
                                )
                            );
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};
