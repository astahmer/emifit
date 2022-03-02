import { TextInput } from "@/components/TextInput";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { Box, Button, ButtonGroup, FormControl, FormLabel, IconButton, Stack, Wrap, WrapItem } from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { useForm } from "react-hook-form";
import { AddTag, ExerciseName } from "@/Exercises/ExerciseName";
import { ExerciseListCombobox } from "@/Exercises/ExerciseCombobox";
import { useRef } from "react";

export function EditSettingsStep() {
    const interpret = useProgramInterpret();
    const send = interpret.send;

    const selectedExercises = useSelector(interpret, (s) => s.context.exerciseList);
    const form = useForm({ defaultValues: { programName: "" } });

    const editExerciseList = useRef([]);

    return (
        <>
            <Stack>
                {interpret.state.matches("creating.editSettings.initial") && (
                    <FormControl>
                        <FormLabel>Selected exercises</FormLabel>
                        <Wrap>
                            {selectedExercises.map((exo) => (
                                <WrapItem key={exo.id}>
                                    <ExerciseName
                                        exercise={exo}
                                        onRemove={
                                            selectedExercises.length > 1
                                                ? (exerciseId) => send({ type: "UnselectExercise", exerciseId })
                                                : undefined
                                        }
                                    />
                                </WrapItem>
                            ))}
                            <WrapItem d="flex" alignItems="center">
                                <AddTag onClick={() => send({ type: "StartEditingExerciseList" })} />
                            </WrapItem>
                        </Wrap>
                    </FormControl>
                )}
                {interpret.state.matches("creating.editSettings.editingExerciseList") && (
                    <ExerciseListCombobox
                        minItems={1}
                        onSelectedItemsChange={(e) => (editExerciseList.current = e.selectedItems)}
                        initialSelectedItems={selectedExercises}
                        renderRight={() => (
                            <ButtonGroup alignItems="center" size="sm" colorScheme="telegram">
                                <IconButton
                                    icon={<CloseIcon />}
                                    variant="outline"
                                    aria-label="close"
                                    onClick={() => send({ type: "CancelEditing" })}
                                />
                                <IconButton
                                    icon={<CheckIcon />}
                                    variant="solid"
                                    aria-label="validate"
                                    onClick={() =>
                                        send({ type: "ConfirmEditing", selection: editExerciseList.current })
                                    }
                                />
                            </ButtonGroup>
                        )}
                    />
                )}
                <Box
                    as="form"
                    onSubmit={form.handleSubmit((v) => send({ type: "Submit", programName: v.programName }))}
                >
                    <TextInput
                        {...form.register("programName", { required: true })}
                        label="Program name"
                        error={form.formState.errors.programName}
                    />
                    <Button
                        mt="4"
                        isFullWidth
                        leftIcon={<CheckIcon />}
                        colorScheme="pink"
                        variant="solid"
                        type="submit"
                        size="lg"
                    >
                        Create
                    </Button>
                </Box>
            </Stack>
        </>
    );
}
