import { SwitchInput } from "@/components/SwitchInput";
import { serializeExercise } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { makeId } from "@/functions/utils";
import { orm } from "@/orm";
import { useCurrentDailyInvalidate, useCurrentDailyQuery } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { makeExercise } from "@/orm-utils";
import { routeMap } from "@/routes";
import { Box } from "@chakra-ui/react";
import { useInterpret, useSelector } from "@xstate/react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { ExerciseFormMachineProvider, makeExerciseFormMachine } from "./ExerciseFormMachine";
import { SingleExerciseForm } from "./SingleExerciseForm";
import { SupersetForm } from "./SupersetForm";

export const ExerciseAddPage = () => {
    const query = useCurrentDailyQuery();
    const daily = query.data;

    const service = useInterpret(makeExerciseFormMachine);
    const isSuperset = useSelector(service, (state) => state.matches("superset"));

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const invalidate = useCurrentDailyInvalidate();

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
            onSuccess: (_, vars) => {
                queryClient.invalidateQueries(orm.exercise.name);
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
                queryClient.invalidateQueries(orm.exercise.name);
                invalidate();
                navigate(routeMap.home);
            },
        }
    );

    return (
        <ExerciseFormMachineProvider value={service}>
            <Box px="8" py="4" minH={0}>
                <SwitchInput
                    id="isSuperset"
                    label="Is it a superset ?"
                    onChange={(e) => service.send(e.target.checked ? "AddExercise" : "RemoveExercise")}
                />
            </Box>
            {!isSuperset ? (
                <SingleExerciseForm onSubmit={addExerciseToDaily.mutate} />
            ) : (
                <SupersetForm onSubmit={addExerciseSupersetToDaily.mutate} />
            )}
        </ExerciseFormMachineProvider>
    );
};
