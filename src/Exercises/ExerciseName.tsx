import { Exercise } from "@/orm-types";
import { AddIcon } from "@chakra-ui/icons";
import { Tag, TagCloseButton, TagLabel, TagProps } from "@chakra-ui/react";

export function ExerciseName({
    exercise,
    onRemove,
}: {
    exercise: Exercise;
    onRemove?: (exerciseId: Exercise["id"]) => void;
}) {
    return (
        <Tag size="lg" colorScheme="pink" borderRadius="full" variant="subtle">
            <TagLabel>{exercise.name}</TagLabel>
            {onRemove && <TagCloseButton onClick={() => onRemove(exercise.id)} />}
        </Tag>
    );
}

export const AddTag = (props: TagProps) => {
    return (
        <Tag size="md" colorScheme="telegram" borderRadius="full" variant="outline" {...props}>
            <AddIcon />
        </Tag>
    );
};
