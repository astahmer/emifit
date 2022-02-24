import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { Exercise, useExerciseList } from "@/store";
import { AddIcon, CheckCircleIcon, CheckIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Box, Button, Divider, Heading, IconButton, UseRadioGroupReturn } from "@chakra-ui/react";
import { useMachine, useSelector } from "@xstate/react";
import { createContext, ReactNode, useContext, useState } from "react";
import { InterpreterFrom } from "xstate";
import { programFormMachine } from "../Programs/programFormMachine";
import { CategoryRadioPicker } from "../Exercises/CategoryRadioPicker";
import { ExerciseAccordionList } from "../Exercises/ExerciseAccordionList";
import { Show } from "@/components/Show";
import { createContextWithHook } from "@/functions/createContext";
import { CheckboxButton } from "@/components/CheckboxCircle";
import { RadioCard, RadioCardPicker } from "@/components/RadioCard";

const ProgramContext = createContext(null as InterpreterFrom<typeof programFormMachine>["send"]);
const [ProgramInterpretProvider, useProgramInterpretContext] =
    createContextWithHook<InterpreterFrom<typeof programFormMachine>>("ProgramInterpretContext");

export const ProgramsPage = () => {
    const [state, send, interpret] = useMachine(programFormMachine);
    console.log(state.value);

    return (
        <ProgramContext.Provider value={send}>
            <ProgramInterpretProvider value={interpret}>
                <Box id="ProgramsPage" d="flex" h="100%" p="4" w="100%">
                    {state.matches("initial") && <InitialState />}
                    {state.matches("creating") && <CreateProgramForm />}
                </Box>
            </ProgramInterpretProvider>
        </ProgramContext.Provider>
    );
};

const InitialState = () => {
    const programs = [];
    const send = useContext(ProgramContext);

    return (
        <Box d="flex" flexDirection="column" m="auto" mt="100%" alignItems="center">
            {Boolean(!programs.length) && (
                <>
                    <Box m="4">
                        <Alert status="info" rounded="full">
                            <AlertIcon />
                            No programs yet !
                        </Alert>
                    </Box>
                    <Divider mb="4" />
                </>
            )}
            {/* TODO programs card */}
            <Button
                leftIcon={<AddIcon />}
                colorScheme="pink"
                variant="solid"
                py="4"
                mb="4"
                size="lg"
                onClick={() => send("StartCreatingProgram")}
            >
                Add program
            </Button>
        </Box>
    );
};

const CreateProgramForm = () => {
    const exercises = useExerciseList();
    const [selectedExercises, setSelectedExercises] = useState([] as string[]);
    const hasSelectedExercises = Boolean(selectedExercises.length);

    const send = useContext(ProgramContext);
    const interpret = useProgramInterpretContext();

    const category = useSelector(interpret, (s) => s.context.categoryId);
    const isCategorySelected = Boolean(category);

    const onCreated = (exercise: Exercise) => send({ type: "CreateExercise", exercise });
    const hasSomeExercisePersisted = Boolean(exercises.length);
    console.log(exercises.length, interpret.state.value, interpret.state.context);

    return (
        <Box d="flex" flexDirection="column" m="auto" w="100%" h="100%">
            <Box m="auto">
                <PickCategoryStep
                    isCategorySelected={isCategorySelected}
                    onChange={(catId) =>
                        send({ type: "SelectCategory", categoryId: catId, hasExercises: hasSomeExercisePersisted })
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
                                        getButtonProps={(state) => ({ opacity: state.isDisabled ? undefined : 1 })}
                                    >
                                        {interpret.state.context.exerciseList.length ? "Create another" : "Create"}
                                    </RadioCard>
                                    <RadioCard
                                        {...getRadioProps({ value: "select" })}
                                        isDisabled={!hasSomeExercisePersisted}
                                        getButtonProps={(state) => ({ opacity: state.isDisabled ? undefined : 1 })}
                                    >
                                        {interpret.state.context.exerciseList.length
                                            ? "Select exercises"
                                            : "Skip & select exercises"}
                                    </RadioCard>
                                </>
                            )}
                        />
                    </>
                )}
                {interpret.state.matches("creating.selectingExercises") && (
                    <PickExercisesStep hasSelectedExercises={hasSelectedExercises} />
                )}
            </Box>
            {interpret.state.matches("creating.maybeCreatingExercise.creatingExercise") && isCategorySelected && (
                <CreateExerciseStep {...{ hasSelectedExercises, category, onCreated }} />
            )}
        </Box>
    );
};

function CreateExerciseStep({
    hasSelectedExercises,
    category,
    onCreated,
}: {
    hasSelectedExercises: boolean;
    category: string;
    onCreated: (data: Exercise) => void;
}) {
    return (
        <>
            <Heading
                as="h3"
                size="md"
                textAlign="center"
                textDecoration={hasSelectedExercises ? "line-through" : undefined}
                opacity={hasSelectedExercises ? "0.5" : undefined}
                color="pink.500"
                mb="3"
            >
                <CheckboxButton isActive={hasSelectedExercises} aria-label="Step 1 done" />
                Create an exercise :
            </Heading>
            <CreateExerciseForm
                catId={category}
                onCreated={onCreated}
                // shouldPersist={false}
                renderSubmit={(form) => {
                    const [name, tags] = form.watch(["name", "tags"]);

                    return (
                        Boolean(name && tags.length) && (
                            <>
                                <Divider />
                                <div>
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
                                </div>
                            </>
                        )
                    );
                }}
            />
            {/* TODO Program.name */}
        </>
    );
}

function PickExercisesStep({ hasSelectedExercises }: { hasSelectedExercises: boolean }) {
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
            <Box p="4">
                <ExerciseAccordionList />
            </Box>
        </>
    );
}

function PickCategoryStep({
    isCategorySelected,
    onChange,
}: {
    isCategorySelected: boolean;
    onChange: (value: string) => void;
}) {
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
                <CategoryRadioPicker onChange={onChange} />
            </Box>
        </>
    );
}
