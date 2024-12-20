import { ConfirmationButton } from "@/fields/ConfirmationButton";
import { VFlex } from "@/components/VFlex";
import { RadioCardButton } from "@/fields/RadioCard";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { ExerciseGridView } from "@/Exercises/ExerciseGrid";
import { orm } from "@/orm";
import { useCurrentDaily, useHasProgram } from "@/orm-hooks";
import { Program } from "@/orm-types";
import { formatDailyIdToDailyEntryParam } from "@/orm-utils";
import { ProgramCard } from "@/Programs/ProgramCard";
import { ProgramCombobox } from "@/Programs/ProgramCombobox";
import { isDailyTodayAtom, useCompactContext } from "@/store";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    ButtonGroup,
    ButtonProps,
    Divider,
    Flex,
    IconButton,
    Stack,
    Text,
    useDisclosure,
    UseDisclosureReturn,
} from "@chakra-ui/react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { MdChecklist, MdGridView, MdList } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { Link as ReactLink } from "react-router-dom";
import { match } from "ts-pattern";
import { useProgramForDailyMutation } from "../Programs/useProgramForDailyMutation";
import { DailyExerciseListView } from "./DailyExerciseListView";
import { DailyExerciseTaskListView } from "./DailyExerciseTaskListView";
import { CompactViewButton } from "./ExpandButton";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";
import { GoToClosestPreviousDailyEntryButton } from "./GoToClosestPreviousDailyEntryButton";
import { useLastFilledDailyDate } from "./useLastFilledDailyDate";

export const WithDaily = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    const daily = useCurrentDaily();
    const hasAtLeastOneExercise = daily.exerciseList?.length > 0;

    const updateDailyCategory = useMutation((category: string) => orm.daily.upsert(daily.id, { category }), {
        onSuccess: daily.invalidate,
    });

    return (
        <>
            <CategoryRadioPicker
                value={daily.category}
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
            {daily.exerciseList?.length > 1 && <ListToolbar />}
            <DailyExerciseList />
        </>
    );
};

const ListToolbar = () => {
    const viewType = useAtomValue(viewTypeAtom);
    const daily = useCurrentDaily();
    const withCompactViewButton =
        viewType === "task" ? (daily.exerciseList.some((exo) => exo.supersetId) ? true : false) : true;

    const toggle = useDisclosure({ defaultIsOpen: true });

    return (
        <Box pos="relative" marginBottom={viewType === "grid" ? (toggle.isOpen ? "-15px" : "27px") : undefined}>
            <Flex
                mx="auto"
                p="2"
                w="100%"
                alignItems="center"
                minH="42px"
                pos={!toggle.isOpen ? "absolute" : undefined}
                left={!toggle.isOpen ? "-3px" : undefined}
                top="0"
            >
                <SwitchViewType toggle={toggle} />
                {withCompactViewButton && toggle.isOpen && (
                    <Box ml="auto">
                        <CompactViewButton />
                    </Box>
                )}
            </Flex>
        </Box>
    );
};

type ViewType = "task" | "grid" | "list";
const viewTypeAtom = atom("task" as ViewType);

const SwitchViewType = ({ toggle }: { toggle: UseDisclosureReturn }) => {
    const setViewType = useSetAtom(viewTypeAtom);
    const [_isCompact, setIsCompact] = useCompactContext();

    return (
        <ButtonGroup
            size="xs"
            isAttached
            colorScheme="pink"
            onClick={(e) => {
                const value = (e.target as HTMLButtonElement).value;
                if (!value) return;
                setViewType(value as ViewType);
                setIsCompact(true);
            }}
        >
            <IconButton
                icon={toggle.isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                aria-label="close"
                colorScheme="gray"
                onClick={toggle.onToggle}
            />
            {toggle.isOpen && (
                <>
                    <ViewTypeButton leftIcon={<MdChecklist />} value="task">
                        Task view
                    </ViewTypeButton>
                    <ViewTypeButton leftIcon={<MdGridView />} value="grid">
                        Grid view
                    </ViewTypeButton>
                    <ViewTypeButton leftIcon={<MdList />} value="list">
                        List view
                    </ViewTypeButton>
                </>
            )}
        </ButtonGroup>
    );
};

const ViewTypeButton = (props: ButtonProps) => {
    const isActive = useAtomValue(viewTypeAtom) === props.value;
    return <Button {...props} isActive={isActive} variant={isActive ? "solid" : "outline"} />;
};

const DailyExerciseList = () => {
    const daily = useCurrentDaily();
    const hasAtLeastOneExercise = daily?.exerciseList.length > 0;
    const viewType = useAtomValue(viewTypeAtom);

    return hasAtLeastOneExercise ? (
        match(viewType)
            .with("task", () => <DailyExerciseTaskListView exerciseList={daily.exerciseList} />)
            .with("grid", () => <ExerciseGridView exerciseList={daily.exerciseList} />)
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

    const daily = useCurrentDaily();
    const hasProgram = useHasProgram({ index: "by-category", query: daily.category });

    useEffect(() => {
        if (showProgramCombobox && !hasProgram) {
            setShowProgramCombobox(false);
        }
    }, [showProgramCombobox, hasProgram]);

    return (
        <VFlex h="100%" justifyContent="center">
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
                    <ReactLink to={`/daily/entry/${formatDailyIdToDailyEntryParam(daily.id)}/exercise/add`}>
                        <RadioCardButton as="div" variant="solid">
                            Add exercise
                        </RadioCardButton>
                    </ReactLink>
                </Box>
            </Stack>
            {showProgramCombobox && <ProgramSearch />}
        </VFlex>
    );
};

const ProgramSearch = () => {
    const [selectedProgram, setSelectedProgram] = useState<Program>(null);

    const daily = useCurrentDaily();
    const programMutation = useProgramForDailyMutation();

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
                    <ConfirmationButton
                        onConfirm={() => programMutation.mutate(selectedProgram)}
                        colorScheme="whatsapp"
                        renderTrigger={(onOpen) => (
                            <Button
                                leftIcon={<CheckIcon />}
                                colorScheme="pink"
                                variant="solid"
                                py="4"
                                mb="4"
                                size="lg"
                                onClick={onOpen}
                            >
                                Use this program
                            </Button>
                        )}
                    />
                </>
            )}
        </Stack>
    );
};

const PastEmptyExerciseList = () => {
    const lastFilledDaily = useLastFilledDailyDate();

    return (
        <VFlex h="100%" justifyContent="center">
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
        </VFlex>
    );
};
