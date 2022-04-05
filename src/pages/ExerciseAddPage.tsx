import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { Categories } from "@/constants";
import { Box, Button, Divider, Heading } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckIcon } from "@chakra-ui/icons";
import { useAtomValue } from "jotai";
import { currentDailyIdAtom, useDailyInvalidate } from "@/store";
import { useMutation } from "react-query";
import { orm } from "@/orm";
import { Exercise } from "@/orm-types";

export const ExerciseAddPage = () => {
    const [params] = useSearchParams();
    const catId = params.get("category") || Categories[0].id;

    const dailyId = useAtomValue(currentDailyIdAtom);
    const invalidate = useDailyInvalidate();

    const navigate = useNavigate();
    const updateDaily = useMutation(
        (exo: Exercise) =>
            orm.daily.upsert(dailyId, (current) => ({
                ...current,
                exerciseList: (current.exerciseList || []).concat(exo.id),
            })),
        {
            onSuccess: () => {
                invalidate();
                navigate("/");
            },
        }
    );

    return (
        <Box id="CreateExercisePage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">Add daily exercise</Heading>
            <Box mt="auto" minH="0">
                <CreateExerciseForm
                    catId={catId}
                    onSubmit={updateDaily.mutate}
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
            </Box>
        </Box>
    );
};
