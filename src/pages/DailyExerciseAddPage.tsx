import { Show } from "@/components/Show";
import { SwitchInput } from "@/fields/SwitchInput";
import { DailySupersetForm } from "@/Exercises/SupersetForm";
import { serializeExercise } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { makeId, printDate } from "@/functions/utils";
import { orm } from "@/orm";
import { useCurrentDailyInvalidate, useDailyQuery } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { makeExercise } from "@/orm-utils";
import { routeMap } from "@/routes";
import { Box } from "@chakra-ui/react";
import { useInterpret, useSelector } from "@xstate/react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { ExerciseFormMachineProvider, makeExerciseFormMachine } from "../Exercises/ExerciseFormMachine";
import { DailySingleExerciseForm } from "../Exercises/SingleExerciseForm";

export const DailyExerciseAddPage = ({ exercise }: { exercise?: Exercise }) => {
    const query = useDailyQuery(printDate(new Date()));
    const daily = query.data;

    const service = useInterpret(() =>
        makeExerciseFormMachine({
            singleForm: exercise ? { ...exercise, nbSeries: exercise?.series?.length || 0 } : ({} as any),
        })
    );
    const isInitialized = useSelector(service, () => service.initialized);
    const isSuperset = useSelector(service, (state) => state.matches("superset"));

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const invalidate = useCurrentDailyInvalidate();

    const addExerciseToDaily = useMutation(
        async (exo: Exercise) => {
            await orm.exercise.add({ ...serializeExercise(exo), name: exo.name.trim() });
            return orm.daily.upsert(daily.id, (current) => ({
                ...current,
                exerciseList: (current.exerciseList || []).concat(exo.id),
                completedList: (current.completedList || []).concat(exo.id), // Added that since ExerciseCheckbox has been commented out
            }));
        },
        {
            onSuccess: (_, vars) => {
                queryClient.invalidateQueries([orm.exercise.name]);
                invalidate();
                navigate(routeMap.home);
                toasts.success(`Exercise <${vars.name}> added !`);
            },
        }
    );

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
                queryClient.invalidateQueries([orm.exercise.name]);
                invalidate();
                navigate(routeMap.home);
            },
        }
    );

    return (
        <ExerciseFormMachineProvider value={service}>
            <Show when={isInitialized}>
                <Box px="8" py="4" minH={0}>
                    <SwitchInput
                        id="isSuperset"
                        label="Is it a superset ?"
                        onChange={(e) => service.send(e.target.checked ? "AddExercise" : "RemoveExercise")}
                    />
                </Box>
                {!isSuperset ? (
                    <DailySingleExerciseForm onSubmit={addExerciseToDaily.mutate} />
                ) : (
                    <DailySupersetForm onSubmit={addExerciseSupersetToDaily.mutate} />
                )}
            </Show>
        </ExerciseFormMachineProvider>
    );
};