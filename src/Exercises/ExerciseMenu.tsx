import { ConfirmationButton } from "@/fields/ConfirmationButton";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, HStack, IconButton } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { Link as ReactLink } from "react-router-dom";
import { FaRegCopy } from "react-icons/fa";

export function ExerciseMenu({ exo }: { exo: Exercise }) {
    const daily = useCurrentDaily();

    const removeExerciseFromDaily = useMutation(
        async () => {
            await orm.daily.upsert(daily.id, (current) => ({
                ...current,
                completedList: current.completedList.filter((completed) => exo.id !== completed),
                exerciseList: current.exerciseList.filter((exercise) => exo.id !== exercise),
            }));
            return orm.exercise.delete(exo.id);
        },
        { onSuccess: daily.invalidate }
    );

    return (
        <HStack ml="auto" mt="2" aria-label="menu">
            <IconButton
                as={ReactLink}
                to={`/daily/entry/${printDailyDate(daily.date)}/exercise/edit/${exo.id}`}
                icon={<EditIcon />}
                aria-label="Edit"
                size="sm"
                colorScheme="pink"
                variant="outline"
            >
                Edit daily exercise
            </IconButton>
            <ConfirmationButton
                renderTrigger={(onOpen) => (
                    <IconButton
                        icon={<DeleteIcon />}
                        onClick={onOpen}
                        aria-label="Delete"
                        size="sm"
                        colorScheme="pink"
                        variant="outline"
                    >
                        Remove exercise from daily
                    </IconButton>
                )}
                onConfirm={() => removeExerciseFromDaily.mutate()}
            />
        </HStack>
    );
}

export function PastDailyExerciseMenu({ exo }: { exo: Exercise }) {
    return (
        <Box ml="auto" mt="2" aria-label="menu">
            <IconButton
                as={ReactLink}
                to={`/daily/entry/${printDailyDate(new Date())}/exercise/copy?exoId=${exo.id}`}
                icon={<FaRegCopy />}
                aria-label="Copy exercise"
                size="sm"
                colorScheme="pink"
                variant="outline"
            />
        </Box>
    );
}

export function SupersetExerciseMenu({ exerciseList }: { exerciseList: Exercise[] }) {
    const daily = useCurrentDaily();

    const removeSupersetFromDaily = useMutation(
        async () => {
            const removedExerciseIdList = exerciseList.map((exercise) => exercise.id);
            await Promise.all(exerciseList.map((exo) => orm.exercise.delete(exo.id)));

            return orm.daily.upsert(daily.id, (current) => ({
                ...current,
                completedList: current.completedList.filter((completed) => !removedExerciseIdList.includes(completed)),
                exerciseList: current.exerciseList.filter((exercise) => !removedExerciseIdList.includes(exercise)),
            }));
        },
        { onSuccess: daily.invalidate }
    );

    const firstExo = exerciseList[0];

    return (
        <HStack ml="auto" mt="2" aria-label="menu">
            <IconButton
                as={ReactLink}
                to={`/daily/entry/${printDailyDate(daily.date)}/exercise/superset/edit/${firstExo.supersetId}`}
                icon={<EditIcon />}
                aria-label="Edit"
                size="sm"
                colorScheme="pink"
                variant="outline"
            >
                Edit daily exercise
            </IconButton>
            <ConfirmationButton
                renderTrigger={(onOpen) => (
                    <IconButton
                        icon={<DeleteIcon />}
                        onClick={onOpen}
                        aria-label="Delete"
                        size="sm"
                        colorScheme="pink"
                        variant="outline"
                    >
                        Remove exercise from daily
                    </IconButton>
                )}
                onConfirm={() => removeSupersetFromDaily.mutate()}
            />
        </HStack>
    );
}
