import { RadioCard, RadioCardPicker } from "@/components/RadioCard";
import { Exercise } from "@/orm-types";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { useExerciseList } from "@/orm-hooks";
import { Box, Divider } from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { CreateExerciseStep } from "./Steps/CreateExerciseStep";
import { EditSettingsStep } from "./Steps/EditSettingsStep";
import { PickCategoryStep } from "./Steps/PickCategoryStep";
import { PickExercisesStep } from "./Steps/PickExercisesStep";

export function ProgramForm() {
    const exercises = useExerciseList();

    const interpret = useProgramInterpret();
    const send = interpret.send;

    const selectedExerciseList = useSelector(interpret, (s) => s.context.exerciseList);
    const hasSelectedExercises = Boolean(selectedExerciseList.length);

    const category = useSelector(interpret, (s) => s.context.categoryId);
    const isCategorySelected = Boolean(category);

    const scopedExercises = exercises.filter((ex) => ex.category === category);
    const hasExercises = Boolean(selectedExerciseList.length || scopedExercises.length);

    const onSubmit = (exercise: Exercise) => send({ type: "CreateExercise", exercise });

    return (
        <Box d="flex" flexDirection="column" m="auto" w="100%" h="100%" minH={0}>
            <Box d="flex" flexDirection="column" m="auto" w="100%" maxH="100%">
                <PickCategoryStep />
                {interpret.state.matches("creating.maybeCreatingExercise.shouldCreateChoice") && (
                    <>
                        <Divider mb="4" />
                        <RadioCardPicker
                            onChange={(v) =>
                                send({ type: v === "create" ? "GoToCreateExercise" : "GoToSelectExercises" })
                            }
                            renderOptions={(getRadioProps) => (
                                <>
                                    <RadioCard
                                        {...getRadioProps({ value: "create" })}
                                        getButtonProps={(_state) => ({ opacity: 1 })}
                                    >
                                        Create exercise
                                    </RadioCard>
                                    <RadioCard
                                        {...getRadioProps({ value: "select" })}
                                        isDisabled={!hasExercises}
                                        getButtonProps={(_state) => ({ opacity: 1 })}
                                    >
                                        Select exercises
                                    </RadioCard>
                                </>
                            )}
                        />
                    </>
                )}
                {interpret.state.matches("creating.selectingExercises") && (
                    <PickExercisesStep hasSelectedExercises={hasSelectedExercises} />
                )}
                {interpret.state.matches("creating.editSettings") && <EditSettingsStep />}
            </Box>
            {interpret.state.matches("creating.maybeCreatingExercise.creatingExercise") && isCategorySelected && (
                <CreateExerciseStep {...{ hasSelectedExercises, category, onSubmit }} />
            )}
        </Box>
    );
}
