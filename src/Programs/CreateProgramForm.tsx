import { RadioCard, RadioCardPicker } from "@/components/RadioCard";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { Exercise, useExerciseList } from "@/store";
import { Box, Divider } from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { CreateExerciseStep } from "./Steps/CreateExerciseStep";
import { EditSettingsStep } from "./Steps/EditSettingsStep";
import { PickCategoryStep } from "./Steps/PickCategoryStep";
import { PickExercisesStep } from "./Steps/PickExercisesStep";

export function CreateProgramForm() {
    const exercises = useExerciseList();

    const interpret = useProgramInterpret();
    const send = interpret.send;

    const selectedExercisesId = useSelector(interpret, (s) => s.context.exerciseList);
    const hasSelectedExercises = Boolean(selectedExercisesId.length);

    const category = useSelector(interpret, (s) => s.context.categoryId);
    const isCategorySelected = Boolean(category);

    const scopedExercises = exercises.filter((ex) => ex.category === category);
    const hasExercises = Boolean(scopedExercises.length);

    const onCreated = (exercise: Exercise) => send({ type: "CreateExercise", exercise });

    return (
        <Box d="flex" flexDirection="column" m="auto" w="100%" h="100%">
            <Box m="auto">
                <PickCategoryStep
                    isCategorySelected={isCategorySelected}
                    onChange={(categoryId) =>
                        send({
                            type: "SelectCategory",
                            categoryId,
                            hasExercises: exercises.some((ex) => ex.category === categoryId),
                        })
                    }
                />
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
                <CreateExerciseStep {...{ hasSelectedExercises, category, onCreated }} />
            )}
        </Box>
    );
}
