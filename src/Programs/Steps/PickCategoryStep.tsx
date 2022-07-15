import { CheckboxButton } from "@/fields/CheckboxCircle";
import { Box, Heading } from "@chakra-ui/react";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { useProgramInterpret } from "../useProgramInterpret";
import { useExerciseList } from "@/orm-hooks";
import { useSelector } from "@xstate/react";

export function PickCategoryStep() {
    const interpret = useProgramInterpret();

    const category = useSelector(interpret, (s) => s.context.categoryId);
    const isCategorySelected = Boolean(category);

    const exerciseList = useExerciseList({ index: "by-category", query: category });

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
                    defaultValue={category}
                    onChange={(categoryId) =>
                        interpret.send({
                            type: "SelectCategory",
                            categoryId,
                            hasExercises: exerciseList.some((ex) => ex.category === categoryId),
                        })
                    }
                    isOptionDisabled={
                        interpret.state.matches("creating.selectingExercises")
                            ? (option) => !exerciseList.some((ex) => ex.category === option.id)
                            : undefined
                    }
                />
            </Box>
        </>
    );
}
