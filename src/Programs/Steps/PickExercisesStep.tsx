import { CheckboxButton } from "@/components/CheckboxCircle";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { useExerciseList } from "@/store";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Button, Heading } from "@chakra-ui/react";
import { ExerciseAccordionList } from "@/Exercises/ExerciseAccordionList";

export function PickExercisesStep({ hasSelectedExercises }: { hasSelectedExercises: boolean }) {
    const interpret = useProgramInterpret();
    const send = interpret.send;

    const exercises = useExerciseList();

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
                        onChange={(ids) =>
                            send({
                                type: "UpdateSelection",
                                selection: ids.map((id) => exercises.find((exo) => exo.id === id)),
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
        </>
    );
}
