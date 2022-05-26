import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { orm } from "@/orm";
import { Exercise } from "@/orm-types";
import { routeMap } from "@/routes";
import { currentDailyIdAtom, showSkeletonsAtom } from "@/store";
import { useCurrentDailyInvalidate, useCurrentDailyQuery } from "@/orm-hooks";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { DailyExerciseTaskListSkeleton } from "@/Daily/DailyExerciseTaskListSkeleton";
import { SwitchInput } from "@/components/SwitchInput";
import { makeId } from "@/functions/utils";
import { serializeExercise } from "@/functions/snapshot";
import { makeArrayOf } from "@pastable/core";
import { useWatch } from "react-hook-form";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { useInterpret, useSelector } from "@xstate/react";
import { makeExerciseAddPageMachine } from "./exerciseAddPageMachine";
import { InterpreterFrom } from "xstate";
import { makeExercise } from "@/orm-utils";
import { Fragment } from "react";

const [ExerciseAddPageProvider, useExerciseAddPageContext] =
    createContextWithHook<InterpreterFrom<typeof makeExerciseAddPageMachine>>("ExerciseAddPageContext");

export const ExerciseAddPage = () => {
    const dailyId = useAtomValue(currentDailyIdAtom);
    const query = useCurrentDailyQuery();
    const daily = query.data;

    const showSkeletons = useAtomValue(showSkeletonsAtom);

    const service = useInterpret(makeExerciseAddPageMachine);
    const isSuperset = useSelector(service, (state) => state.matches("superset"));

    if (showSkeletons || query.isLoading) {
        return (
            <Flex as="section" flexDirection="column" h="100%" minH={0}>
                <Flex justifyContent="space-around">
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                </Flex>
                <Divider mt="4" />
                <DailyExerciseTaskListSkeleton />
            </Flex>
        );
    }

    return (
        <Box id="CreateExercisePage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">Add daily exercise </Heading>
            <Heading as="h2" size="md">
                {dailyId} - {daily?.category}
            </Heading>
            {daily && (
                <Box d="flex" flexDirection="column" mt="auto" minH="0">
                    <Box px="8" py="4" minH={0}>
                        <SwitchInput
                            id="isSuperset"
                            label="Is it a superset ?"
                            onChange={(e) => service.send(e.target.checked ? "AddExercise" : "RemoveExercise")}
                        />
                    </Box>

                    <ExerciseAddPageProvider value={service}>
                        {!isSuperset ? <SingleExerciseForm /> : <SupersetForm />}
                    </ExerciseAddPageProvider>
                </Box>
            )}
        </Box>
    );
};

const SingleExerciseForm = () => {
    const query = useCurrentDailyQuery();
    const daily = query.data;

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const invalidate = useCurrentDailyInvalidate();

    const service = useExerciseAddPageContext();

    const addExerciseToDaily = useMutation(
        async (exo: Exercise) => {
            await orm.exercise.add(serializeExercise(exo));
            return orm.daily.upsert(daily.id, (current) => ({
                ...current,
                exerciseList: (current.exerciseList || []).concat(exo.id),
                completedList: (current.completedList || []).concat(exo.id), // Added that since ExerciseCheckbox has been commented out
            }));
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(orm.exercise.name);
                invalidate();
                navigate(routeMap.home);
            },
        }
    );

    return (
        <CreateExerciseForm
            id="add-form"
            defaultValues={service.initialized ? service.state.context.singleForm : undefined}
            category={daily.category}
            onSubmit={addExerciseToDaily.mutate}
            onChange={(values) => service.send({ type: "UpdateForm", form: values })}
            renderSubmit={(form) => {
                const [name, tags] = useWatch({ control: form.control, name: ["name", "tags"] });

                return (
                    Boolean(name && tags.length) && (
                        <Box p="4" pb="0">
                            <Divider />
                            <Box py="4">
                                <Button
                                    mt="4"
                                    isFullWidth
                                    leftIcon={<CheckIcon />}
                                    colorScheme="pink"
                                    variant="solid"
                                    type="submit"
                                    size="lg"
                                >
                                    Create
                                </Button>
                            </Box>
                        </Box>
                    )
                );
            }}
        />
    );
};

const SupersetForm = () => {
    const query = useCurrentDailyQuery();
    const daily = query.data;

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const invalidate = useCurrentDailyInvalidate();

    const service = useExerciseAddPageContext();
    const exoCount = useSelector(service, (state) => state.context.exerciseCount);
    const canSubmit = useSelector(service, (state) => state.matches("superset.canSubmit"));

    const addExerciseSupersetToDaily = useMutation(
        async () => {
            const tx = orm.db.transaction([orm.exercise.name, orm.daily.name], "readwrite");
            const [exoStore, dailyStore] = [tx.objectStore(orm.exercise.name), tx.objectStore(orm.daily.name)];

            const supersetId = makeId();
            const forms = Object.values(service.state.context.supersetForms);
            const newExerciseList = forms.map((exo) => {
                const exercise = makeExercise({ ...exo, category: daily.category });
                return serializeExercise({ ...exercise, supersetId });
            });
            await Promise.all(newExerciseList.map((exo) => exoStore.add(exo)));

            await dailyStore.put({
                ...daily,
                exerciseList: (daily.exerciseList.map((e) => e.id) || []).concat(newExerciseList.map((e) => e.id)),
                completedList: (daily.completedList || []).concat(newExerciseList.map((e) => e.id)), // Added that since ExerciseCheckbox has been commented out
            });

            return await tx.done;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(orm.exercise.name);
                invalidate();
                navigate(routeMap.home);
            },
        }
    );

    return (
        <Stack h="100%" overflow="auto" minH={0}>
            {makeArrayOf(exoCount).map((_, i) => (
                <Fragment key={i}>
                    {i > 0 && (
                        <Box px="8">
                            <Divider my="2" />
                        </Box>
                    )}
                    <Box px="6">
                        <Heading as="h3" size="md" color="pink.300" mb="-4">
                            Exercise {i + 1}
                        </Heading>
                    </Box>
                    <CreateExerciseForm
                        category={daily.category}
                        defaultValues={service.state.context.supersetForms[i]}
                        onChange={(values) => service.send({ type: "UpdateSupersetForm", index: i, form: values })}
                        shouldOverflow={false}
                    />
                </Fragment>
            ))}
            {canSubmit && (
                <Box p="4" pb="0">
                    <Divider />
                    <Box py="4">
                        <Button
                            mt="4"
                            isFullWidth
                            leftIcon={<CheckIcon />}
                            colorScheme="pink"
                            variant="solid"
                            size="lg"
                            onClick={() => addExerciseSupersetToDaily.mutate()}
                        >
                            Create superset
                        </Button>
                    </Box>
                </Box>
            )}
        </Stack>
    );
};
