import { CheckboxButton } from "@/fields/CheckboxCircle";
import { FloatingButton } from "@/components/FloatingButton";
import { ExerciseAccordionList } from "@/Exercises/ExerciseAccordionList";
import { ExerciseListCombobox } from "@/Exercises/ExerciseCombobox";
import { useExerciseList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Heading, IconButton } from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { useState } from "react";

export function PickExercisesStep({ hasSelectedExercises }: { hasSelectedExercises: boolean }) {
    const interpret = useProgramInterpret();
    const send = interpret.send;

    const catId = useSelector(interpret, (s) => s.context.categoryId);
    const exerciseListByCategory = useExerciseList({ index: "by-category", query: catId });

    const [byNameList, setByNameList] = useState<Exercise[]>([]);

    let exerciseList = exerciseListByCategory;
    if (byNameList.length) {
        exerciseList = exerciseList.filter((exo) =>
            byNameList.map((exo) => exo.name).some((name) => name.toLowerCase() === exo.name.toLowerCase())
        );
    }

    return (
        <>
            <Heading
                as="h3"
                size="md"
                textAlign="center"
                textDecoration={hasSelectedExercises ? "line-through" : undefined}
                opacity={hasSelectedExercises ? "0.5" : undefined}
                color="pink.500"
            >
                <CheckboxButton isActive={hasSelectedExercises} aria-label="Select one or more exercises" />
                Then, select some exercises:
            </Heading>
            {interpret.state.matches("creating.selectingExercises") && (
                <Box p="4" overflow="auto" minH={0} h="100%">
                    <ExerciseAccordionList
                        exerciseList={exerciseList}
                        onChange={(ids) =>
                            send({
                                type: "UpdateSelection",
                                selection: ids.map((id) => exerciseList.find((exo) => exo.id === id)),
                            })
                        }
                    />
                </Box>
            )}
            {interpret.state.matches("creating.selectingExercises.hasSelection") && (
                <Button
                    mt="4"
                    isFullWidth
                    leftIcon={<ArrowForwardIcon />}
                    colorScheme="pink"
                    variant="solid"
                    size="lg"
                    onClick={() => send({ type: "GoToProgramSettings" })}
                    flexShrink={0}
                >
                    Edit program settings
                </Button>
            )}
            <FloatingButton
                renderButton={(props) => (
                    <IconButton
                        aria-label="Search"
                        icon={<SearchIcon />}
                        colorScheme="pink"
                        rounded="full"
                        size="lg"
                        onClick={props.onOpen}
                    />
                )}
                renderModalContent={() => (
                    <Box py="4">
                        <ExerciseListCombobox
                            initialSelectedItems={byNameList}
                            onSelectedItemsChange={(changes) => setByNameList(changes.selectedItems || [])}
                            params={{ index: "by-category", query: catId }}
                            placeholder="Search for some exercise..."
                        />
                    </Box>
                )}
            />
        </>
    );
}
