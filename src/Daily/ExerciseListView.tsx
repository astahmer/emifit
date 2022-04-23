import { CheckboxCircleInFragment, CheckboxSquare } from "@/components/CheckboxCircle";
import { ConfirmationButton } from "@/components/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { RadioCardButton } from "@/components/RadioCard";
import { ExerciseTag } from "@/Exercises/ExerciseTag";
import { orm } from "@/orm";
import { Exercise } from "@/orm-types";
import { routeMap } from "@/routes";
import { isDailyTodayAtom } from "@/store";
import { useDaily } from "@/orm-hooks";
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
    Spacer,
    Text,
    UnorderedList,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { Fragment } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";

export const ExerciseListView = () => {
    const daily = useDaily();
    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const navigate = useNavigate();

    return (
        <Flex flexDir="column" overflow="auto" h="100%" pt="2" pb="8">
            <ExerciseList exerciseList={daily.exerciseList} />
            <Divider my="4" />
            <CardioLine />
            <Divider my="4" />
            <Box alignSelf="center">
                {isDailyToday ? (
                    <RadioCardButton onClick={() => navigate("/exercise/grid")}>Add exercise</RadioCardButton>
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
