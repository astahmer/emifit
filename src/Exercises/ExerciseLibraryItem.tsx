import { Show } from "@/components/Show";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { Exercise } from "@/orm-types";
import {
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Flex,
    Stack,
    Text,
    useAccordionContext,
} from "@chakra-ui/react";
import { ExerciseTopSetsTable, getExerciseListWithTops } from "./ExerciseTopSetsTable";

export const ExerciseLibraryItem = ({
    exercise,
    index,
    exerciseList,
}: {
    exercise: Exercise;
    index: number;
    exerciseList: Exercise[];
}) => {
    const ctx = useAccordionContext();
    const isFocused = ctx.focusedIndex === index;

    const { topKg, topReps } = getExerciseListWithTops(exerciseList);

    return (
        <AccordionItem w="100%" isDisabled={!exerciseList.length}>
            <AccordionButton w="100%">
                <Stack direction="row" alignItems="center" w="100%">
                    <Stack alignItems="flex-start" w="100%">
                        <Flex alignItems="center">
                            <Text mr="1" fontWeight="bold">
                                {exercise.name}
                            </Text>
                            <Text fontSize="xs">({exerciseList.length})</Text>
                        </Flex>
                        {Boolean(exercise.tags?.length) && <ExerciseTagList tagList={exercise.tags} />}
                    </Stack>
                </Stack>
                <Show when={ctx.index === index}>
                    <Stack mx="2">
                        <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                            Top kg {topKg}
                        </Badge>
                        <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                            Top reps {topReps}
                        </Badge>
                    </Stack>
                </Show>
                {Boolean(exerciseList.length) && <AccordionIcon ml="auto" />}
            </AccordionButton>
            <AccordionPanel
                pb={4}
                borderWidth="1px"
                borderColor="pink.100"
                borderRadius="md"
                borderTopLeftRadius={0}
                borderTopRightRadius={0}
                sx={{ th: { whiteSpace: "nowrap" } }}
            >
                {isFocused && (
                    <ExerciseTopSetsTable
                        exerciseList={exerciseList}
                        tableProps={{ hiddenColumns: ["topReps", "kgWithTopReps"] }}
                    />
                )}
            </AccordionPanel>
        </AccordionItem>
    );
};
