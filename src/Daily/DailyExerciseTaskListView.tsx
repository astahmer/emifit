import { CheckboxCircleInFragment } from "@/components/CheckboxCircle";
import { RadioCardButton } from "@/components/RadioCard";
import { Scrollable } from "@/components/Scrollable";
import { ExerciseGrid } from "@/Exercises/ExerciseGrid";
import { ExerciseMenu } from "@/Exercises/ExerciseMenu";
import { ExerciseSetList, ExerciseSetListOverview } from "@/Exercises/ExerciseSetList";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { groupBy } from "@/functions/groupBy";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise, WithExerciseList } from "@/orm-types";
import { formatDailyIdToDailyEntryParam } from "@/orm-utils";
import { currentDailyIdAtom, isDailyTodayAtom } from "@/store";
import { Box, Divider, Flex, Heading, Spacer, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { Fragment } from "react";
import { useMutation } from "react-query";
import { Link as ReactLink } from "react-router-dom";
import { ExerciseCheckbox } from "../Exercises/ExerciseCheckbox";
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
