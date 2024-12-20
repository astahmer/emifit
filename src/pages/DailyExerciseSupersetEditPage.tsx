import { DailySupersetForm } from "@/Exercises/SupersetForm";
import { serializeExercise } from "@/functions/snapshot";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { routeMap } from "@/routes";
import { useInterpret, useSelector } from "@xstate/react";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ExerciseFormMachineProvider, makeExerciseFormMachine } from "../Exercises/ExerciseFormMachine";

export const DailyExerciseSupersetEditPage = () => {
    const params = useParams<{ supersetId: string }>();
    const supersetId = params.supersetId;

    const daily = useCurrentDaily();
    const exerciseList = daily?.exerciseList?.filter((exo) => exo.supersetId === supersetId);

    const service = useInterpret(() =>
        makeExerciseFormMachine({
            exerciseCount: exerciseList.length,
            supersetForms: Object.fromEntries(
                exerciseList.map((exercise, index) => [index, { ...exercise, nbSeries: exercise.series.length }])
            ),
        })
    );
    const isInitialized = useSelector(service, () => service.initialized);

    const navigate = useNavigate();
    const editSupersetExerciseList = useMutation(
        () => {
            return Promise.all(
                exerciseList.map((exo, index) =>
                    orm.exercise.upsert(exo.id, (current) => ({
                        ...serializeExercise({ ...current, ...service.state.context.supersetForms[index] }),
                    }))
                )
            );
        },
        {
            onSuccess: () => {
                daily.invalidate();
                navigate(routeMap.home);
            },
        }
    );

    useEffect(() => {
        if (!supersetId) {
            navigate(routeMap.home);
        }
    }, [supersetId, navigate]);

    return (
        <ExerciseFormMachineProvider value={service}>
            {exerciseList?.length && isInitialized && <DailySupersetForm onSubmit={editSupersetExerciseList.mutate} />}
        </ExerciseFormMachineProvider>
    );
};
