import { CheckboxCircleInFragment, CheckboxSquare } from "@/components/CheckboxCircle";
import { ConfirmationButton } from "@/components/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { RadioCardButton } from "@/components/RadioCard";
import { Scrollable } from "@/components/Scrollable";
import { ExerciseSetList, ExerciseSetListOverview } from "@/Exercises/ExerciseSetList";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise, WithExerciseList } from "@/orm-types";
import { routeMap } from "@/routes";
import { isDailyTodayAtom } from "@/store";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
    Box,
    Divider,
    Flex,
    Heading,
    ListItem,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    OrderedList,
    Spacer,
    Text,
} from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { useAtomValue } from "jotai";
import { Fragment } from "react";
import { useMutation } from "react-query";
import { Link as ReactLink, useNavigate } from "react-router-dom";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";

export const DailyExerciseTaskListView = ({ exerciseList }: WithExerciseList) => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return (
        <ExerciseTaskListView exerciseList={exerciseList}>
            <Divider my="4" />
            <CardioLine />
            <Divider my="4" />
            <Box alignSelf="center">
                {isDailyToday ? (
                    <ReactLink to="exercise/add">
                        <RadioCardButton>Add exercise</RadioCardButton>
                    </ReactLink>
                ) : (
                    <GoBackToTodayEntryButton />
                )}
            </Box>
        </ExerciseTaskListView>
    );
};

const ExerciseTaskListView = ({ children, exerciseList }: { exerciseList: Exercise[] } & Partial<WithChildren>) => {
    return (
        <Scrollable pt="2" pb="8">
            <ExerciseTaskList exerciseList={exerciseList} />
            {children}
        </Scrollable>
    );
};

const ExerciseTaskList = ({ exerciseList }: { exerciseList: Exercise[] }) => (
    <>
        {exerciseList.map((exo, index) => {
            return (
                <Fragment key={index}>
                    {index > 0 && (
                        <Box px="8">
                            <Divider my="2" />
                        </Box>
                    )}
                    <ExerciseTaskItem exo={exo} />
                </Fragment>
            );
        })}
    </>
);

function ExerciseTaskItem({ exo }: { exo: Exercise }) {
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
