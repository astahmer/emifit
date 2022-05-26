import { CheckboxCircleInFragment, CheckboxSquare } from "@/components/CheckboxCircle";
import { ConfirmationButton } from "@/components/ConfirmationButton";
import { RadioCardButton } from "@/components/RadioCard";
import { Scrollable } from "@/components/Scrollable";
import { ExerciseGrid } from "@/Exercises/ExerciseGrid";
import { ExerciseSetList, ExerciseSetListOverview } from "@/Exercises/ExerciseSetList";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { groupBy } from "@/functions/groupBy";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise, WithExerciseList } from "@/orm-types";
import { formatDailyIdToDailyEntryParam, printDailyDate } from "@/orm-utils";
import { currentDailyIdAtom, isDailyTodayAtom } from "@/store";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Divider, Flex, Heading, HStack, IconButton, Spacer, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { Fragment } from "react";
import { useMutation } from "react-query";
import { Link as ReactLink, useNavigate } from "react-router-dom";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";

export const DailyExerciseTaskListView = ({ exerciseList }: WithExerciseList) => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const dailyId = useAtomValue(currentDailyIdAtom);

    return (
        <Scrollable pt="2" pb="8">
            <ExerciseTaskList exerciseList={exerciseList} />
            <Divider my="4" />
            <CardioLine />
            <Divider my="4" />
            <Box alignSelf="center">
                {isDailyToday ? (
                    <ReactLink to={`/daily/entry/${formatDailyIdToDailyEntryParam(dailyId)}/exercise/add`}>
                        <RadioCardButton>Add exercise</RadioCardButton>
                    </ReactLink>
                ) : (
                    <GoBackToTodayEntryButton />
                )}
            </Box>
        </Scrollable>
    );
};

const ExerciseTaskList = ({ exerciseList }: { exerciseList: Exercise[] }) => {
    const taskList = [] as Array<Exercise | Exercise[]>;
    const addedSuperset = [] as Array<Exercise["supersetId"]>;
    const groupedBySupersetId = groupBy(exerciseList, (exercise) => exercise.supersetId);

    for (let i = 0; i < exerciseList.length; i++) {
        const exo = exerciseList[i];
        if (exo.supersetId) {
            if (addedSuperset.includes(exo.supersetId)) continue;
            taskList.push(groupedBySupersetId[exo.supersetId]);
            addedSuperset.push(exo.supersetId);
        } else {
            taskList.push(exo);
        }
    }

    let supersetIndex = 0;

    return (
        <>
            {taskList.map((exoOrSuperset, index) => {
                if (Array.isArray(exoOrSuperset)) {
                    supersetIndex++;
                    return (
                        <Fragment key={index}>
                            {index > 0 && (
                                <Box px="8">
                                    <Divider my="2" />
                                </Box>
                            )}
                            <Box px="4" pt="2">
                                <Heading as="h3" size={"sm"} opacity={"0.5"} color="pink.500">
                                    Superset {supersetIndex}
                                </Heading>
                                <ExerciseGrid exerciseList={exoOrSuperset} />
                            </Box>
                        </Fragment>
                    );
                }
                return (
                    <Fragment key={index}>
                        {index > 0 && (
                            <Box px="8">
                                <Divider my="2" />
                            </Box>
                        )}
                        <ExerciseTaskItem exo={exoOrSuperset} />
                    </Fragment>
                );
            })}
        </>
    );
};

function ExerciseTaskItem({ exo }: { exo: Exercise }) {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <Flex>
            {/* Currently that is deadcode but i'm leaving it just in case one day she wants it back */}
            {isDailyToday && false ? (
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
                <ExerciseSetListOverview setList={exo.series} />
                <ExerciseTagList mt="2" tagList={exo.tags} />
                <ExerciseSetList mt="2" fontSize="sm" setList={exo.series} />
            </Flex>
        </Flex>
    );
}

const ExerciseCheckbox = ({ exo }: { exo: Exercise }) => {
    const daily = useCurrentDaily();
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
            defaultChecked={daily.completedList.some((completed) => completed === exo.id)}
            onChange={(e) => addExerciseToDailyCompletedList.mutate(e.target.checked)}
            isDisabled={!isDailyToday}
        />
    );
};

const CardioCheckbox = () => {
    const daily = useCurrentDaily();

    const toggleDailyCardio = useMutation(
        (hasDoneCardio: boolean) => orm.daily.upsert(daily.id, (current) => ({ ...current, hasDoneCardio })),
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
    const daily = useCurrentDaily();

    const removeExerciseFromDaily = useMutation(
        async () => {
            await orm.daily.upsert(daily.id, (current) => ({
                ...current,
                completedList: current.completedList.filter((completed) => exo.id !== completed),
                exerciseList: current.exerciseList.filter((exercise) => exo.id !== exercise),
            }));
            return orm.exercise.delete(exo.id);
        },
        { onSuccess: daily.invalidate }
    );

    const navigate = useNavigate();

    return (
        <HStack ml="auto" mt="2" aria-label="menu">
            <IconButton
                icon={<EditIcon />}
                onClick={() => navigate(`/daily/entry/${printDailyDate(daily.date)}/exercise/edit/${exo.id}`)}
                aria-label="Edit"
                size="sm"
                colorScheme="pink"
                variant="outline"
            >
                Edit daily exercise
            </IconButton>
            <ConfirmationButton
                renderTrigger={(onOpen) => (
                    <IconButton
                        icon={<DeleteIcon />}
                        onClick={onOpen}
                        aria-label="Delete"
                        size="sm"
                        colorScheme="pink"
                        variant="outline"
                    >
                        Remove exercise from daily
                    </IconButton>
                )}
                onConfirm={() => removeExerciseFromDaily.mutate()}
            />
        </HStack>
    );
};
