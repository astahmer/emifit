import { CheckboxButton } from "@/components/CheckboxCircle";
import { Box, Heading } from "@chakra-ui/react";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { useProgramInterpret } from "../useProgramInterpret";
import { useExerciseList } from "@/store";

export function PickCategoryStep({
    isCategorySelected,
    onChange,
}: {
    isCategorySelected: boolean;
    onChange: (value: string) => void;
}) {
    const interpret = useProgramInterpret();
    const exercises = useExerciseList();

    return (
        <>
            <Heading
                as="h3"
                size={isCategorySelected ? "sm" : "md"}
                textAlign="center"
                textDecoration={isCategorySelected ? "line-through" : undefined}
                opacity={isCategorySelected ? "0.5" : undefined}
                color="pink.500"
            >
                <CheckboxButton isActive={isCategorySelected} aria-label="Pick a category" />
                First, pick a category :
            </Heading>
            <Box d="flex" w="100%" p="4">
                <CategoryRadioPicker
                    onChange={onChange}
                    isOptionDisabled={
                        interpret.state.matches("creating.selectingExercises")
                            ? (option) => !exercises.some((ex) => ex.category === option.id)
                            : undefined
                    }
                />
            </Box>
        </>
    );
}
