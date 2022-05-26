import { ConfirmationButton } from "@/components/ConfirmationButton";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { HStack, IconButton } from "@chakra-ui/react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

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

    const navigate = useNavigate();

    return (
        <HStack ml="auto" mt="2" aria-label="menu">
            <IconButton
                icon={<EditIcon />}
                onClick={() => navigate(`/daily/entry/${printDailyDate(daily.date)}/exercise/edit/${exo.id}`)}
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