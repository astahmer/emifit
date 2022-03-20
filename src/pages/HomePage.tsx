import { CalendarButton } from "@/components/CalendarButton";
import { HFlex } from "@/components/HFlex";
import { RadioCardButton } from "@/components/RadioCard";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { ExerciseTag } from "@/Exercises/ExerciseTag";
import { parseDate } from "@/functions/utils";
import { orm } from "@/orm";
import { Exercise } from "@/orm-types";
import { currentDailyIdAtom, currentDateAtom, isDailyTodayAtom, useDaily, useDailyInvalidate } from "@/store";
import { ChevronLeftIcon, ChevronRightIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
    Alert,
    AlertIcon,
    Box,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    ListItem,
    OrderedList,
    Stack,
    Text,
} from "@chakra-ui/react";
import { addDays, isFuture } from "date-fns";
import { useAtom, useAtomValue } from "jotai";
import { Fragment } from "react";
import { useMutation, useQuery } from "react-query";
import { Link as ReactLink } from "react-router-dom";

export const HomePage = () => {
    return (
        <>
            <Header />
            <DailyEntry />
        </>
    );
};

const Header = () => {
    const [currentDate, setDate] = useAtom(currentDateAtom);
    const isNextDayInFuture = isFuture(addDays(currentDate, 1));

    return (
        <Flex p="4" justifyContent="space-between" alignItems="center">
            <IconButton
                variant="unstyled"
                aria-label="Prev day"
                icon={<ChevronLeftIcon fontSize="32px" />}
                onClick={() => setDate((current) => addDays(current, -1))}
            />
            <CalendarButton selectedDate={currentDate} onChange={setDate} />
            <IconButton
                variant="unstyled"
                aria-label="Next day"
                icon={<ChevronRightIcon fontSize="32px" />}
                isDisabled={isNextDayInFuture}
                onClick={() => setDate((current) => addDays(current, 1))}
            />
        </Flex>
    );
};

const DailyEntry = () => {
    const query = useDaily();
    const daily = query.data;

    return (
        <Flex flexDirection="column" h="100%" minH={0}>
            {daily ? <WithDaily /> : <WithoutDaily />}
        </Flex>
    );
};

const WithoutDaily = () => {
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
        (category: string) =>
            orm.daily.create(id, { id, category, date: new Date(), exerciseList: [], completedList: [] }),
        { onSuccess: invalidate }
    );

    return (
        <>
            <Box m="4">
                <Alert status="info" rounded="full" justifyContent="center">
                    <AlertIcon />
                    No category picked yet !
                </Alert>
            </Box>
            <Divider mb="4" />
            <Box alignSelf="center">
                <CategoryRadioPicker onChange={createDaily.mutate} />
            </Box>
        </>
    );
};

const EmptyPastDay = () => {
    const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
    const keysQuery = useQuery(["daily", "keys"], () => orm.daily.keys());
    const keys = keysQuery.data || [];

    const mutation = useMutation(async () => {
        const lastFilledDaily = keys
            .map((k) => parseDate(k.toString()))
            .sort()
            .reverse()
            .find((d) => d < currentDate);

        if (lastFilledDaily) {
            setCurrentDate(lastFilledDaily);
        }
    });

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
            {keys.length ? (
                <>
                    <Divider mb="4" />
                    <Box alignSelf="center">
                        <RadioCardButton onClick={mutation.mutate.bind(undefined)}>
                            Jump to the last filled daily entry
                        </RadioCardButton>
                    </Box>
                </>
            ) : null}
        </>
    );
};

const WithDaily = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    const query = useDaily();
    const daily = query.data;
    const hasAtLeastOneExercise = daily.exerciseList.length > 0;
    console.log(query.data);

    const updateDaily = useMutation((category: string) => orm.daily.upsert(daily.id, { category }), {
        onSuccess: query.invalidate,
    });

    return (
        <>
            <CategoryRadioPicker
                defaultValue={daily.category}
                onChange={updateDaily.mutate}
                isDisabled={!isDailyToday || hasAtLeastOneExercise}
            />
            <Divider mt="4" />
            <DailyExerciseList />
        </>
    );
};

const DailyExerciseList = () => {
    const query = useDaily();
    const hasAtLeastOneExercise = query.data?.exerciseList.length > 0;

    return hasAtLeastOneExercise ? <ExerciseList /> : <EmptyExerciseList />;
};

const EmptyExerciseList = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return isDailyToday ? <TodayEmptyExerciseList /> : <PastEmptyExerciseList />;
};

const TodayEmptyExerciseList = () => {
    return (
        <HFlex h="100%" justifyContent="center">
            <Box m="4">
                <Alert status="info" rounded="full" justifyContent="center">
                    <AlertIcon />
                    No exercise added yet !
                </Alert>
            </Box>
            <Divider mb="4" />
            <Box alignSelf="center">
                <ReactLink to="/add-exercise">
                    <RadioCardButton as="div">Add exercise</RadioCardButton>
                </ReactLink>
            </Box>
            <Box alignSelf="center">
                {/* TODO */}
                <RadioCardButton as="div">Add program</RadioCardButton>
            </Box>
        </HFlex>
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
        </HFlex>
    );
};

const ExerciseList = () => {
    const query = useDaily();

    return (
        <Flex flexDir="column" overflow="auto" h="100%" pt="2" pb="8">
            {query.data.exerciseList.map((exo, index) => {
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
            {/* bouton cardio done yes/no + confirmation */}
            <Divider my="4" />
            <Box alignSelf="center">
                <ReactLink to="/add-exercise">
                    <RadioCardButton as="div">Add exercise</RadioCardButton>
                </ReactLink>
            </Box>
        </Flex>
    );
};

function ExerciseItem({ exo }: { exo: Exercise }) {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <Flex flexDirection="column" px="8">
            <Flex w="100%" alignItems="flex-end">
                <Heading as="h4" size="md">
                    {exo.name}
                </Heading>
                {/* TODO checkbox done yes/no */}
                {/* TODO triple dots menu ? (edit/delete/...) */}
                {isDailyToday && (
                    <HStack ml="auto" mt="2">
                        {/* TODO link to add-exo-like (/edit-exercise/:id) page avec valeurs préfill */}
                        <IconButton
                            rounded="full"
                            variant="solid"
                            size="sm"
                            colorScheme="purple"
                            aria-label="Edit"
                            icon={<EditIcon />}
                        />
                        {/* Confirmation on click */}
                        <IconButton
                            rounded="full"
                            variant="solid"
                            size="sm"
                            colorScheme="red"
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                        />
                    </HStack>
                )}
            </Flex>
            <Text fontWeight="normal" fontSize="sm" color="gray.500">
                {exo.series.length} sets of {exo.series.map((set) => set.reps).join("/")} reps
            </Text>
            <Stack direction="row" mt="2">
                {exo.tags.map((tag) => (
                    <ExerciseTag key={tag.id} tag={tag} />
                ))}
            </Stack>
            <OrderedList mt="2">
                <ListItem>Lorem ipsum dolor sit amet</ListItem>
                <ListItem>Consectetur adipiscing elit</ListItem>
                <ListItem>Integer molestie lorem at massa</ListItem>
                <ListItem>Facilisis in pretium nisl aliquet</ListItem>
            </OrderedList>
        </Flex>
    );
}
