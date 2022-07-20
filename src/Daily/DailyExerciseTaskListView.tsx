import { CheckboxCircleInFragment } from "@/fields/CheckboxCircle";
import { ConfirmationButton } from "@/fields/ConfirmationButton";
import { RadioCardButton } from "@/fields/RadioCard";
import { Scrollable } from "@/components/Scrollable";
import { Show } from "@/components/Show";
import { TextInput } from "@/fields/TextInput";
import { ExerciseGrid } from "@/Exercises/ExerciseGrid";
import { ExerciseMenu, PastDailyExerciseMenu, SupersetExerciseMenu } from "@/Exercises/ExerciseMenu";
import { groupBy } from "@/functions/groupBy";
import { serializeExercise, serializeProgram } from "@/functions/snapshot";
import { onError, toasts } from "@/functions/toasts";
import { makeId } from "@/functions/utils";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise, Program, WithExerciseList } from "@/orm-types";
import { formatDailyIdToDailyEntryParam } from "@/orm-utils";
import { currentDailyIdAtom, debugModeAtom, isDailyTodayAtom } from "@/store";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, Divider, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import confetti from "canvas-confetti";
import { useAtomValue } from "jotai";
import { Fragment, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Link as ReactLink } from "react-router-dom";
import { GoBackToTodayEntryButton } from "./GoBackToTodayEntryButton";
import { ExerciseTaskItem } from "../Exercises/ExerciseTaskItem";
import { DailyExerciseCheckbox } from "./DailyExerciseCheckbox";

export const DailyExerciseTaskListView = ({ exerciseList }: WithExerciseList) => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const dailyId = useAtomValue(currentDailyIdAtom);

    return (
        <Scrollable pt="2" pb="8">
            <DailyExerciseTaskList exerciseList={exerciseList} />
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
            <Divider my="4" />
            <UseAsProgramButton />
        </Scrollable>
    );
};

const DailyExerciseTaskList = ({ exerciseList }: { exerciseList: Exercise[] }) => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);

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
                                <Box d="flex" alignItems="flex-end">
                                    <Heading as="h3" size={"sm"} opacity={"0.5"} color="pink.500">
                                        Superset {supersetIndex}
                                    </Heading>

                                    {isDailyToday && <SupersetExerciseMenu exerciseList={exoOrSuperset} />}
                                </Box>
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
                        <DailyExerciseTaskItem exo={exoOrSuperset} />
                    </Fragment>
                );
            })}
        </>
    );
};

export function DailyExerciseTaskItem({ exo }: { exo: Exercise }) {
    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const debugMode = useAtomValue(debugModeAtom);

    return (
        <ExerciseTaskItem
            exo={exo}
            /* Currently that is deadcode but i'm leaving it just in case one day she wants it back */
            renderLeft={() =>
                isDailyToday && false ? (
                    <Flex h="100%" alignItems="center" px="8">
                        <DailyExerciseCheckbox exo={exo} />
                    </Flex>
                ) : null
            }
            renderAfterName={() =>
                isDailyToday || debugMode ? <ExerciseMenu exo={exo} /> : <PastDailyExerciseMenu exo={exo} />
            }
        />
    );
}

const CardioCheckbox = () => {
    const daily = useCurrentDaily();

    const toggleDailyCardio = useMutation(
        (hasDoneCardio: boolean) => orm.daily.upsert(daily.id, (current) => ({ ...current, hasDoneCardio })),
        {
            onSuccess: (_, hasDoneCardio) => {
                daily.invalidate();
                if (hasDoneCardio) {
                    confetti();
                }
            },
        }
    );
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    return daily.hasDoneCardio ? (
        <ConfirmationButton
            onConfirm={() => toggleDailyCardio.mutate(false)}
            renderTrigger={(onOpen) => (
                <CheckboxCircleInFragment
                    getIconProps={() => ({ size: "sm" })}
                    onChange={onOpen}
                    isChecked={daily.hasDoneCardio}
                    defaultChecked={daily.hasDoneCardio}
                    isDisabled={!isDailyToday}
                />
            )}
        />
    ) : (
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

const UseAsProgramButton = () => {
    const daily = useCurrentDaily();
    const queryClient = useQueryClient();

    const mutation = useMutation(
        async () => {
            const tx = orm.exercise.tx("readwrite");
            const programId = makeId();
            const newExos = daily.exerciseList.map((exo) => ({
                ...exo,
                id: makeId(),
                madeFromExerciseId: exo.id,
                programId: programId,
            }));
            const insertMany = newExos.map((exo) => tx.store.add(serializeExercise(exo)));

            const now = new Date();
            const programName = nameRef.current.value;

            return Promise.all([
                ...insertMany,
                orm.program.add({
                    ...serializeProgram({
                        category: daily.category,
                        id: programId,
                        name: programName,
                        exerciseList: newExos,
                    } as Program),
                    createdAt: now,
                    updatedAt: now,
                }),
                tx.done,
            ]);
        },
        {
            onSuccess: () => {
                const programName = nameRef.current.value;
                queryClient.invalidateQueries([orm.program.name]);
                toasts.success(`Program <${programName}> cloned`);

                setShowProgramNameInput(false);
                setCanCreate(false);
            },
            onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
        }
    );

    const [showProgramNameInput, setShowProgramNameInput] = useState(false);

    useEffect(() => {
        if (showProgramNameInput && !daily.exerciseList?.length) {
            setShowProgramNameInput(false);
        }
    }, [showProgramNameInput, daily.exerciseList]);

    const nameRef = useRef<HTMLInputElement>();
    const [canCreate, setCanCreate] = useState(false);

    return (
        <Show
            when={showProgramNameInput}
            fallback={
                <Box alignSelf="center">
                    <RadioCardButton py="4" mb="4" onClick={() => setShowProgramNameInput(true)}>
                        Export as program ?
                    </RadioCardButton>
                </Box>
            }
        >
            <ConfirmationButton
                onConfirm={mutation.mutate}
                colorScheme="whatsapp"
                renderTrigger={(onOpen) => (
                    <Stack as="form" onSubmit={(e) => e.preventDefault()} alignSelf="center" mb="8" w="100%" px="4">
                        <TextInput
                            ref={nameRef}
                            onChange={(e) => {
                                if (e.target.value) {
                                    if (canCreate) return;
                                    setCanCreate(true);
                                }

                                if (!canCreate) return;
                                setCanCreate(false);
                            }}
                            label="Program name"
                        />
                        <RadioCardButton
                            leftIcon={<CheckIcon />}
                            py="4"
                            mb="4"
                            onClick={onOpen}
                            disabled={!canCreate}
                            type="submit"
                        >
                            Create program
                        </RadioCardButton>
                    </Stack>
                )}
            />
        </Show>
    );
};
