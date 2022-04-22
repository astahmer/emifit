import { CheckboxCircleInFragment, CheckboxSquare } from "@/components/CheckboxCircle";
import { ConfirmationButton } from "@/components/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { HFlex } from "@/components/HFlex";
import { RadioCardButton } from "@/components/RadioCard";
import { SwitchInput } from "@/components/SwitchInput";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { ExerciseGrid } from "@/Exercises/ExerciseGrid";
import { ExerciseTag } from "@/Exercises/ExerciseTag";
import { groupIn } from "@/functions/groupBy";
import { serializeDaily } from "@/functions/snapshot";
import { makeId, parseDate, printDate } from "@/functions/utils";
import { orm } from "@/orm";
import { Exercise, Program } from "@/orm-types";
import { ProgramCard } from "@/Programs/ProgramCard";
import { ProgramCombobox } from "@/Programs/ProgramCombobox";
import { routeMap } from "@/routes";
import {
    currentDailyIdAtom,
    currentDateAtom,
    gridCondensedViewAtom,
    isDailyTodayAtom,
    showSkeletonsAtom,
    useDaily,
    useDailyInvalidate,
    useDailyQuery,
    useExerciseList,
    useHasProgram,
} from "@/store";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    ListItem,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Skeleton,
    SkeletonCircle,
    Spacer,
    Stack,
    Text,
    UnorderedList,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Fragment, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Link as ReactLink, Route, Routes, useNavigate } from "react-router-dom";

export const DailyEntry = () => {
    const query = useDailyQuery();
    const daily = query.data;
    const showSkeletons = useAtomValue(showSkeletonsAtom);

    if (showSkeletons || query.isLoading) {
        return (
            <Flex as="section" flexDirection="column" h="100%" minH={0}>
                <Flex justifyContent="space-around">
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                </Flex>
                <Divider mt="4" />
                <ExerciseListSkeleton />
            </Flex>
        );
    }

    return (
        <Flex as="section" id="HomeBody" flexDirection="column" h="100%" minH={0}>
            {daily ? <WithDaily /> : <NoDaily />}
        </Flex>
    );
};

const NoDaily = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <HFlex h="100%" justifyContent="center">
            {isDailyToday ? <EmptyTodayDaily /> : <EmptyPastDay />}
        </HFlex>
    );
};

const EmptyTodayDaily = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const invalidate = useDailyInvalidate();

    const createDaily = useMutation(
        (category: string) => {
            const now = new Date();
            return orm.daily.add({ id, category, date: now, time: now.getTime(), exerciseList: [], completedList: [] });
        },
        { onSuccess: invalidate }
    );
    const lastFilledDaily = useLastFilledDaily();

    return (
        <>
            <Box m="4">
                <Alert status="info" rounded="full" justifyContent="center">
                    <AlertIcon />
                    <Text>No category picked yet !</Text>
                </Alert>
                {lastFilledDaily && (
                    <Text fontSize="xs" textAlign="center" mt="1" opacity="0.6">
                        (Last entry's category was {lastFilledDaily.category} on {lastFilledDaily.id})
                    </Text>
                )}
            </Box>
            <Divider mb="4" />
            <Box alignSelf="center">
                <CategoryRadioPicker onChange={createDaily.mutate} />
            </Box>
        </>
    );
};

const useLastFilledDailyDate = () => {
    const query = useQuery(["daily", "keys"], () => orm.daily.keys({ count: 1 }));
    const keys = query.data || [];

    return keys[0] ? parseDate(keys[0]) : null;
};
const useLastFilledDaily = () => {
    const lastFilledDailyDate = useLastFilledDailyDate();
    const dailyId = lastFilledDailyDate && printDate(lastFilledDailyDate);
    const query = useQuery(["lastFilledDaily"], () => orm.daily.find(dailyId), { enabled: Boolean(dailyId) });

    return query.data;
};

const EmptyPastDay = () => {
    const setCurrentDate = useSetAtom(currentDateAtom);
    const lastFilledDaily = useLastFilledDailyDate();

    const mutation = useMutation(() => void setCurrentDate(lastFilledDaily));

    return (
        <>
            <Box m="4">
                <Box m="4">
                    <Alert status="warning" rounded="full" justifyContent="center">
                        <AlertIcon />
                        Nothing to see here !
                    </Alert>
                </Box>
            </Box>
            {lastFilledDaily ? (
                <>
                    <Divider mb="4" />
                    <Box alignSelf="center">
                        <RadioCardButton onClick={mutation.mutate.bind(undefined)}>
                            <ChevronLeftIcon />
                            Go to the closest previous daily entry
                        </RadioCardButton>
                    </Box>
                </>
            ) : null}
        </>
    );
};

const WithDaily = () => {
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

    return hasAtLeastOneExercise ? <WithExerciseList /> : <EmptyExerciseList />;
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

const GoBackToTodayEntryButton = () => {
    const setCurrentDate = useSetAtom(currentDateAtom);
    return (
        <RadioCardButton onClick={() => setCurrentDate(new Date())}>
            Go back to today's entry
            <ChevronRightIcon />
        </RadioCardButton>
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

const WithExerciseList = () => {
    const navigate = useNavigate();
    return (
        <Routes>
            <Route path="/" element={<ExerciseListView onClick={() => navigate("/add")} />} />
            <Route path="/add" element={<ExerciseGridView />} />
        </Routes>
    );
};

const ExerciseGridView = () => {
    const daily = useDaily();
    const exerciseList = useExerciseList({ index: "by-category", query: daily.category });

    const [gridCondensedView, setGridCondensedView] = useAtom(gridCondensedViewAtom);

    return (
        <Flex flexDir="column" overflow="auto" h="100%" pt="2" pb="8">
            <Stack p="2">
                <SwitchInput
                    ml="auto"
                    label="Condensed view"
                    labelProps={{ fontSize: "sm" }}
                    // wrapperProps={{ flexDirection: "row-reverse" }}
                    onChange={(e) => setGridCondensedView(e.target.checked)}
                    isChecked={gridCondensedView}
                />
                <Text>Available exercises in this category :</Text>
            </Stack>
            <ExerciseGrid exerciseList={exerciseList} />
        </Flex>
    );
};

const ExerciseListView = ({ onClick }) => {
    const daily = useDaily();
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <Flex flexDir="column" overflow="auto" h="100%" pt="2" pb="8">
            <ExerciseList exerciseList={daily.exerciseList} />
            <Divider my="4" />
            <CardioLine />
            <Divider my="4" />
            <Box alignSelf="center">
                {/* <ReactLink to="/exercise/add">
            <RadioCardButton as="div">Add exercise</RadioCardButton>
        </ReactLink> */}
                {isDailyToday ? (
                    <RadioCardButton onClick={onClick}>Add exercise</RadioCardButton>
                ) : (
                    <GoBackToTodayEntryButton />
                )}
            </Box>
        </Flex>
    );
};

const ExerciseList = ({ exerciseList }: { exerciseList: Exercise[] }) => (
    <>
        {exerciseList.map((exo, index) => {
            return (
                <Fragment key={index}>
                    {index > 0 && (
                        <Box px="8">
                            <Divider my="2" />
                        </Box>
                    )}
                    <ExerciseItem exo={exo} />
                </Fragment>
            );
        })}
    </>
);

function ExerciseItem({ exo }: { exo: Exercise }) {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <Flex>
            {isDailyToday ? (
                <Flex h="100%" alignItems="center" px="8">
                    <ExerciseCheckbox exo={exo} />
                </Flex>
            ) : (
                <Spacer pl="8" />
            )}
            <Flex flexDirection="column" pr="8" w="100%">
                <Flex w="100%" alignItems="flex-end">
                    <Heading as="h4" size="md">
                        {exo.name}
                    </Heading>
                    {isDailyToday && <ExerciseMenu exo={exo} />}
                </Flex>
                <Text fontWeight="normal" fontSize="sm" color="gray.500">
                    {exo.series.length} sets of {exo.series.map((set) => set.reps).join("/")} reps
                </Text>
                <Wrap mt="2">
                    {exo.tags.map((tag) => (
                        <WrapItem key={tag.id}>
                            <ExerciseTag tag={tag} />
                        </WrapItem>
                    ))}
                </Wrap>
                <UnorderedList mt="2">
                    {exo.series.map((serie) => (
                        <ListItem key={serie.id}>
                            {serie.kg} kg / {serie.reps} reps
                        </ListItem>
                    ))}
                </UnorderedList>
            </Flex>
        </Flex>
    );
}

const ExerciseCheckbox = ({ exo }: { exo: Exercise }) => {
    const daily = useDaily();
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    const addExerciseToDailyCompletedList = useMutation(
        (checked: boolean) =>
            orm.daily.upsert(daily.id, (current) => ({
                ...current,
                completedList: checked
                    ? current.completedList.concat(exo.id)
                    : current.completedList.filter((completed) => exo.id !== completed),
            })),
        { onSuccess: daily.invalidate }
    );

    return (
        <CheckboxSquare
            getIconProps={() => ({ size: "sm" })}
            onChange={(e) => addExerciseToDailyCompletedList.mutate(e.target.checked)}
            isDisabled={!isDailyToday}
        />
    );
};

const CardioCheckbox = () => {
    const daily = useDaily();

    const toggleDailyCardio = useMutation(
        (checked: boolean) => orm.daily.upsert(daily.id, (current) => ({ ...current, hasDoneCardio: checked })),
        { onSuccess: daily.invalidate }
    );
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <CheckboxCircleInFragment
            getIconProps={() => ({ size: "sm" })}
            onChange={(e) => toggleDailyCardio.mutate(e.target.checked)}
            defaultChecked={daily.hasDoneCardio}
            isDisabled={!isDailyToday}
        />
    );
};

const CardioLine = () => (
    <Flex as="label" justifyContent="center">
        <CardioCheckbox />
        <Text ml="2">Cardio done ?</Text>
    </Flex>
);

const ExerciseMenu = ({ exo }: { exo: Exercise }) => {
    const daily = useDaily();

    const removeExerciseFromDaily = useMutation(
        async () => {
            await orm.daily.upsert(daily.id, (current) => ({
                ...current,
                completedList: current.exerciseList.filter((completed) => exo.id !== completed),
                exerciseList: current.completedList.filter((exercise) => exo.id !== exercise),
            }));
            return orm.exercise.delete(exo.id);
        },
        { onSuccess: daily.invalidate }
    );

    const navigate = useNavigate();

    return (
        <Menu strategy="fixed">
            <MenuButton as={DotsIconButton} ml="auto" mt="2" aria-label="menu" />
            <MenuList>
                <MenuItem icon={<EditIcon />} onClick={() => navigate(routeMap.exercise.edit.replace(":id", exo.id))}>
                    Edit daily exercise
                </MenuItem>
                <ConfirmationButton
                    renderTrigger={(onOpen) => (
                        <MenuItem icon={<DeleteIcon />} onClick={onOpen}>
                            Remove exercise from daily
                        </MenuItem>
                    )}
                    onConfirm={() => removeExerciseFromDaily.mutate()}
                />
            </MenuList>
        </Menu>
    );
};

const ExerciseListSkeleton = () => (
    <Stack mt="4">
        <ExerciseItemSkeleton />
        <Box px="8">
            <Divider my="2" />
        </Box>
        <ExerciseItemSkeleton />
        <Box px="8">
            <Divider my="2" />
        </Box>
        <ExerciseItemSkeleton />
    </Stack>
);

const ExerciseItemSkeleton = () => {
    return (
        <Box>
            <Flex flexDirection="column" px="8">
                <Skeleton w="225px" h="22px" />
                <Skeleton mt="2" w="145px" h="18px" />
                <Stack direction="row" mt="2">
                    <Skeleton w="65px" h="13.5px" />
                    <Skeleton w="85px" h="13.5px" />
                </Stack>
                <Stack mt="2">
                    <Stack direction="row">
                        <SkeletonCircle w="20px" h="20px" />
                        <Skeleton w="90px" h="20px" />
                    </Stack>
                    <Stack direction="row">
                        <SkeletonCircle w="20px" h="20px" />
                        <Skeleton w="90px" h="20px" />
                    </Stack>
                </Stack>
            </Flex>
        </Box>
    );
};
