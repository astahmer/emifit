import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { serializeExercise } from "@/functions/snapshot";
import { orm } from "@/orm";
import { Exercise } from "@/orm-types";
import { routeMap } from "@/routes";
import { currentDailyIdAtom, useDaily } from "@/store";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Heading } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

export const ExerciseEditPage = () => {
    const dailyId = useAtomValue(currentDailyIdAtom);
    const [params] = useSearchParams();
    const exerciseId = params.get("exerciseId");

    const query = useDaily();
    const daily = query.data;

    const navigate = useNavigate();
    const editExerciseById = useMutation(
        (exo: Exercise) => orm.exercise.upsert(exerciseId, (current) => ({ ...current, ...serializeExercise(exo) })),
        {
            onSuccess: () => {
                query.invalidate();
                navigate(routeMap.home);
            },
        }
    );

    useEffect(() => {
        if (!exerciseId) {
            navigate(routeMap.home);
        }
    }, []);

    return (
        <Box id="CreateExercisePage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">Edit daily exercise</Heading>
            <Heading as="h2" size="md">
                {dailyId} - {daily?.category}
            </Heading>
            <Box mt="auto" minH="0">
                {daily && (
                    <CreateExerciseForm
                        category={daily.category}
                        onSubmit={editExerciseById.mutate}
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
