import { TextInput } from "@/components/TextInput";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    ButtonGroup,
    Divider,
    FormControl,
    FormLabel,
    IconButton,
    Stack,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { useForm } from "react-hook-form";
import { AddTag, ExerciseName } from "@/Exercises/ExerciseName";
import { ExerciseListCombobox } from "@/Exercises/ExerciseCombobox";
import { Link as ReactLink } from "react-router-dom";
import { useRef } from "react";
import { RadioCardButton } from "@/components/RadioCard";
import { requiredRule } from "@/functions/utils";

export function EditSettingsStep() {
    const interpret = useProgramInterpret();
    const send = interpret.send;

    const selectedExercises = useSelector(interpret, (s) => s.context.exerciseList);
    const programId = useSelector(interpret, (s) => s.context.programId);
    const programName = useSelector(interpret, (s) => s.context.programName);
    const isEditingProgram = Boolean(programId);

    const form = useForm({ defaultValues: { programName } });
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
                                <Button
                                    leftIcon={<CloseIcon />}
                                    variant="outline"
                                    aria-label="close"
                                    onClick={() => send({ type: "CancelEditing" })}
                                >
                                    Cancel editing
                                </Button>
                                <Button
                                    leftIcon={<CheckIcon />}
                                    variant="solid"
                                    aria-label="validate"
                                    onClick={() =>
                                        send({ type: "ConfirmEditing", selection: editExerciseList.current })
                                    }
                                >
                                    Validate selection
                                </Button>
                            </ButtonGroup>
                        )}
                    />
                )}
                <Box
                    as="form"
                    onSubmit={form.handleSubmit((v) => send({ type: "Submit", programName: v.programName }))}
                >
                    <TextInput
                        {...form.register("programName", { required: requiredRule })}
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
                        {isEditingProgram ? "Edit" : "Create"} program
                    </Button>
                    {isEditingProgram && (
                        <>
                            <Divider my="4" />
                            <Box d="flex" justifyContent="center">
                                <ReactLink to="/programs" state={{}} replace>
                                    <RadioCardButton as="div" onClick={() => send("Reset")}>
                                        Cancel & go back to program list
                                    </RadioCardButton>
                                </ReactLink>
                            </Box>
                        </>
                    )}
                </Box>
            </Stack>
        </>
    );
}
