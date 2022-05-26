import { serializeExercise } from "@/functions/snapshot";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { routeMap } from "@/routes";
import { useInterpret } from "@xstate/react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ExercisePageLayoutProvider, makeExerciseAddPageMachine } from "./exerciseAddPageMachine";
import { SupersetForm } from "./SupersetForm";

export const ExerciseSupersetEditPage = () => {
    const params = useParams<{ dailyId: string; supersetId: string }>();
    const supersetId = params.supersetId;

    const daily = useCurrentDaily();
    const exerciseList = daily?.exerciseList?.filter((exo) => exo.supersetId === supersetId);

    const service = useInterpret(() =>
        makeExerciseAddPageMachine({
            exerciseCount: exerciseList.length,
            supersetForms: Object.fromEntries(
                exerciseList.map((exercise, index) => [index, { ...exercise, nbSeries: exercise.series.length }])
            ),
        })
    );

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
        <ExercisePageLayoutProvider value={service}>
            {exerciseList?.length && service.initialized && <SupersetForm onSubmit={editSupersetExerciseList.mutate} />}
        </ExercisePageLayoutProvider>
    );
};
