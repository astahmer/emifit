import { HFlex } from "@/components/HFlex";
import { RadioCardButton } from "@/components/RadioCard";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { groupIn } from "@/functions/groupBy";
import { serializeDaily } from "@/functions/snapshot";
import { makeId } from "@/functions/utils";
import { orm } from "@/orm";
import { useDaily, useHasProgram } from "@/orm-hooks";
import { Program } from "@/orm-types";
import { ProgramCard } from "@/Programs/ProgramCard";
import { ProgramCombobox } from "@/Programs/ProgramCombobox";
import { currentDailyIdAtom, isDailyTodayAtom } from "@/store";
import { CheckIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Box, Button, Divider, Stack, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useMutation } from "react-query";
import { Link as ReactLink } from "react-router-dom";
import { ExerciseListView } from "./ExerciseListView";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";

export const WithDaily = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    const daily = useDaily();
    const hasAtLeastOneExercise = daily.exerciseList.length > 0;

    const updateDailyCategory = useMutation((category: string) => orm.daily.upsert(daily.id, { category }), {
        onSuccess: daily.invalidate,
    });

    return (
        <>
            <CategoryRadioPicker
                defaultValue={daily.category}
                onChange={updateDailyCategory.mutate}
                isDisabled={!isDailyToday || hasAtLeastOneExercise}
            />
            <Divider mt="4" />
            {isDailyToday && !hasAtLeastOneExercise && (
                <Box pos="relative">
                    <Text pos="absolute" top="0" p="4" color="gray.400" fontSize="small" fontStyle="italic">
                        You can update today's category as long as you haven't added any exercises.
                    </Text>
                </Box>
            )}
            <DailyExerciseList />
        </>
    );
};

const DailyExerciseList = () => {
    const daily = useDaily();
    const hasAtLeastOneExercise = daily?.exerciseList.length > 0;

    return hasAtLeastOneExercise ? <ExerciseListView /> : <EmptyExerciseList />;
};

const EmptyExerciseList = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return isDailyToday ? <TodayEmptyExerciseList /> : <PastEmptyExerciseList />;
};

const TodayEmptyExerciseList = () => {
    const [showProgramCombobox, setShowProgramCombobox] = useState(false);

    const daily = useDaily();
    const hasProgram = useHasProgram({ index: "by-category", query: daily.category });

    return (
        <HFlex h="100%" justifyContent="center">
            <Box m="4">
                <Alert status="info" rounded="full" justifyContent="center">
                    <AlertIcon />
                    No exercise added yet !
                </Alert>
            </Box>
            <Divider mb="4" />
            <Stack direction="row" alignSelf="center">
                {!showProgramCombobox && hasProgram && (
                    <Box alignSelf="center">
                        <RadioCardButton as="div" onClick={() => setShowProgramCombobox(true)}>
                            Use program
                        </RadioCardButton>
                    </Box>
                )}
                <Box alignSelf="center">
                    <ReactLink to="/exercise/add">
                        <RadioCardButton as="div" variant="solid">
                            Add exercise
                        </RadioCardButton>
                    </ReactLink>
                </Box>
            </Stack>
            {showProgramCombobox && <ProgramSearch />}
        </HFlex>
    );
};

const ProgramSearch = () => {
    const [selectedProgram, setSelectedProgram] = useState<Program>(null);

    const dailyId = useAtomValue(currentDailyIdAtom);
    const daily = useDaily();

    const useProgramMutation = useMutation(
        async () => {
            const program = await orm.program.find(selectedProgram.id);
            const exerciseList = await orm.exercise.get();
            const exerciseListById = groupIn(exerciseList, "id");

            const exerciseCloneList = program.exerciseList
                .map((id) => exerciseListById[id])
                .map((exo) => ({ ...exo, id: makeId(), madeFromExerciseId: exo.id }));

            const tx = orm.exercise.tx("readwrite");
            const insertMany = exerciseCloneList.map((exo) => tx.store.add(exo));

            return Promise.all([
                ...insertMany,
                orm.daily.upsert(dailyId, (current) => ({
                    ...serializeDaily({
                        ...current,
                        programId: program.id,
                        exerciseList: [],
                    }),
                    exerciseList: current.exerciseList.concat(exerciseCloneList.map((exo) => exo.id)),
                })),
                tx.done,
            ]);
        },
        { onSuccess: daily.invalidate }
    );

    return (
        <Stack alignSelf="center" mt="4" w="100%" px="4">
            <ProgramCombobox
                onSelectedItemChange={(changes) => setSelectedProgram(changes.selectedItem)}
                getItems={(items) => items.filter((prog) => prog.category === daily.category)}
                label={() => null}
                placeholder="Search for a program by name"
            />
            {selectedProgram && (
                <>
                    <ProgramCard program={selectedProgram} defaultIsOpen />
                    <Button
                        leftIcon={<CheckIcon />}
                        colorScheme="pink"
                        variant="solid"
                        py="4"
                        mb="4"
                        size="lg"
                        onClick={useProgramMutation.mutate.bind(undefined)}
                    >
                        Use this program
                    </Button>
                </>
            )}
        </Stack>
    );
};

const PastEmptyExerciseList = () => {
    return (
        <HFlex h="100%" justifyContent="center">
            <Box m="4">
                <Alert status="info" rounded="full" justifyContent="center">
                    <AlertIcon />
                    No exercise on that day !
                </Alert>
            </Box>
            <Divider mb="4" />
            <Box alignSelf="center">
                <GoBackToTodayEntryButton />
            </Box>
        </HFlex>
    );
};
