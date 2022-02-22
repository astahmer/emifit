import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { Exercise, useExerciseList } from "@/store";
import { AddIcon, CheckCircleIcon, CheckIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Box, Button, Divider, Fade, Heading, IconButton } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import { createContext, useContext, useState } from "react";
import { InterpreterFrom } from "xstate";
import { programFormMachine } from "../Programs/programFormMachine";
import { CategoryRadioPicker } from "../Exercises/CategoryRadioPicker";
import { ExerciseAccordionList } from "../Exercises/ExerciseAccordionList";

const ProgramContext = createContext(null as InterpreterFrom<typeof programFormMachine>["send"]);

export const ProgramsPage = () => {
    const [state, send] = useMachine(programFormMachine);
    console.log(state.value);

    return (
        <ProgramContext.Provider value={send}>
            <Box d="flex" h="100%" p="4" w="100%" overflow="auto">
                {state.matches("initial") && <InitialState />}
                {state.matches("creating") && <CreateProgramForm />}
            </Box>
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
    const [category, setCategory] = useState(null as string);
    const isCategorySelected = Boolean(category);
    const exercises = useExerciseList();

    const [selectedExercises, setSelectedExercises] = useState([] as string[]);
    const hasSelectedExercises = Boolean(selectedExercises.length);
    const send = useContext(ProgramContext);

    const onCreated = (created: Exercise) => send({ type: "SelectExercises", value: [created.id] });

    return (
        <Box m="auto" w="100%">
            <PickCategoryStep isCategorySelected={isCategorySelected} onChange={setCategory} />
            <Fade in={isCategorySelected}>
                {Boolean(false && exercises.length) && (
                    <PickExercisesStep hasSelectedExercises={hasSelectedExercises} />
                )}
                {Boolean(true || !exercises.length) && isCategorySelected && (
                    <CreateExerciseStep {...{ hasSelectedExercises, category, onCreated }} />
                )}
            </Fade>
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
            >
                <IconButton
                    colorScheme={hasSelectedExercises ? "pink" : "gray"}
                    aria-label="Step 1 done"
                    size="md"
                    icon={hasSelectedExercises ? <CheckCircleIcon fontSize="x-large" /> : undefined}
                    variant="outline"
                    rounded="full"
                    mr="2"
                    pointerEvents="none"
                />
                Create an exercise :
            </Heading>
            <CreateExerciseForm
                catId={category}
                onCreated={onCreated}
                renderSubmit={(form) => {
                    const [name, tags] = form.watch(["name", "tags"]);

                    return (
                        Boolean(name && tags.length) && (
                            <>
                                <Divider />
                                <div>
                                    <Button
                                        mt="8"
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
                <IconButton
                    colorScheme={hasSelectedExercises ? "pink" : "gray"}
                    aria-label="Step 1 done"
                    size="md"
                    icon={hasSelectedExercises ? <CheckCircleIcon fontSize="x-large" /> : undefined}
                    variant="outline"
                    rounded="full"
                    mr="2"
                    pointerEvents="none"
                />
                Then, select one or more exercises :
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
                <IconButton
                    colorScheme={isCategorySelected ? "pink" : "gray"}
                    aria-label="Step 1 done"
                    size="sm"
                    icon={isCategorySelected ? <CheckCircleIcon fontSize="xl" /> : undefined}
                    variant="outline"
                    rounded="full"
                    mr="2"
                    pointerEvents="none"
                />
                First, pick a category :
            </Heading>
            <Box d="flex" w="100%" p="4">
                <CategoryRadioPicker onChange={onChange} />
                {/* (value) => send({ type: "SelectCategory", value }) */}
            </Box>
        </>
    );
}
