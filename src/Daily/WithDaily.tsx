import { HFlex } from "@/components/HFlex";
import { RadioCardButton } from "@/components/RadioCard";
import { ScrollableStack } from "@/components/Scrollable";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { groupIn } from "@/functions/groupBy";
import { serializeDaily } from "@/functions/snapshot";
import { makeId } from "@/functions/utils";
import { orm } from "@/orm";
import { useDaily, useHasProgram } from "@/orm-hooks";
import { Program } from "@/orm-types";
import { ProgramCard } from "@/Programs/ProgramCard";
import { ProgramCombobox } from "@/Programs/ProgramCombobox";
import { currentDailyIdAtom, isDailyTodayAtom, isCompactViewAtom } from "@/store";
import { CheckIcon } from "@chakra-ui/icons";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    ButtonGroup,
    ButtonProps,
    Divider,
    Flex,
    Heading,
    IconButton,
    Stack,
    Text,
} from "@chakra-ui/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { MdChecklist, MdGridView, MdList, MdOutlineViewCompact } from "react-icons/md";
import { IoMdExpand } from "react-icons/io";
import { useMutation } from "react-query";
import { Link as ReactLink } from "react-router-dom";
import { match } from "ts-pattern";
import { DailyExerciseGridView } from "./DailyExerciseGridView";
import { DailyExerciseTaskListView } from "./DailyExerciseTaskListView";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";
import { DailyExerciseListView } from "./DailyExerciseListView";
import { useLastFilledDailyDate } from "./useLastFilledDailyDate";
import { GoToClosestPreviousDailyEntryButton } from "./GoToClosestPreviousDailyEntryButton";

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
                    <Text pos="relative" top="0" p="4" color="gray.400" fontSize="small" fontStyle="italic">
                        You can update today's category as long as you haven't added any exercises.
                    </Text>
                </Box>
            )}
            {daily.exerciseList.length > 1 && <ListToolbar />}
            <DailyExerciseList />
        </>
    );
};

const ListToolbar = () => {
    const viewType = useAtomValue(viewTypeAtom);
    return (
        <Flex mr="auto" p="2" w="100%" alignItems="center" minH="42px">
            <SwitchViewType />
            {viewType === "grid" && (
                <Box ml="auto">
                    <CompactButton />
                </Box>
            )}
        </Flex>
    );
};

type ViewType = "task" | "grid" | "list";
const viewTypeAtom = atom("task" as ViewType);

const SwitchViewType = () => {
    const setViewType = useSetAtom(viewTypeAtom);

    return (
        <ButtonGroup
            size="xs"
            isAttached
            colorScheme="pink"
            onClick={(e) => {
                const value = (e.target as HTMLButtonElement).value;
                if (!value) return;
                setViewType(value as ViewType);
            }}
        >
            <ViewTypeButton leftIcon={<MdChecklist />} value="task">
                Task view
            </ViewTypeButton>
            <ViewTypeButton leftIcon={<MdGridView />} value="grid">
                Grid view
            </ViewTypeButton>
            <ViewTypeButton leftIcon={<MdList />} value="list">
                List view
            </ViewTypeButton>
        </ButtonGroup>
    );
};

const CompactButton = () => {
    const [isCompact, setCompact] = useAtom(isCompactViewAtom);

    return (
        <IconButton
            size="xs"
            aria-label="Compact grid view"
            icon={isCompact ? <IoMdExpand /> : <MdOutlineViewCompact />}
            isActive={isCompact}
            colorScheme={isCompact ? "pink" : undefined}
            onClick={() => setCompact((current) => !current)}
        />
    );
};

const ViewTypeButton = (props: ButtonProps) => {
    const isActive = useAtomValue(viewTypeAtom) === props.value;
    return <Button {...props} isActive={isActive} variant={isActive ? "solid" : "outline"} />;
};

const DailyExerciseList = () => {
    const daily = useDaily();
    const hasAtLeastOneExercise = daily?.exerciseList.length > 0;
    const viewType = useAtomValue(viewTypeAtom);

    return hasAtLeastOneExercise ? (
        match(viewType)
            .with("task", () => <DailyExerciseTaskListView exerciseList={daily.exerciseList} />)
            .with("grid", () => <DailyExerciseGridView exerciseList={daily.exerciseList} />)
            .with("list", () => <DailyExerciseListView exerciseList={daily.exerciseList} />)
            .exhaustive()
    ) : (
        <EmptyExerciseList />
    );
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
                orm.daily.upsert(dailyId, (current) => {
                    const updatedExerciseList = current.exerciseList.concat(exerciseCloneList.map((exo) => exo.id));

                    return {
                        ...serializeDaily({
                            ...current,
                            programId: program.id,
                            exerciseList: [],
                        }),
                        exerciseList: updatedExerciseList,
                        exerciseListOrder: updatedExerciseList,
                    };
                }),
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
    const lastFilledDaily = useLastFilledDailyDate();

    return (
        <HFlex h="100%" justifyContent="center">
            <Box m="4">
                <Alert status="warning" rounded="full" justifyContent="center">
                    <AlertIcon />
                    No exercise on that day !
                </Alert>
            </Box>
            {lastFilledDaily ? (
                <>
                    <Divider mb="4" />
                    <Box alignSelf="center">
                        <GoToClosestPreviousDailyEntryButton />
                    </Box>
                </>
            ) : null}
            <Divider mb="4" />
            <Box alignSelf="center">
                <GoBackToTodayEntryButton />
            </Box>
        </HFlex>
    );
};
