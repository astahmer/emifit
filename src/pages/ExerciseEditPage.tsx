import { serializeExercise } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { routeMap } from "@/routes";
import { useInterpret } from "@xstate/react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ExercisePageLayoutProvider, makeExerciseAddPageMachine } from "./exerciseAddPageMachine";
import { SingleExerciseForm } from "./SingleExerciseForm";

export const ExerciseEditPage = () => {
    const params = useParams<{ dailyId: string; exoId: string }>();
    const exerciseId = params.exoId;

    const daily = useCurrentDaily();
    const exercise = daily?.exerciseList?.find((exo) => exo.id === exerciseId);

    const service = useInterpret(() =>
        makeExerciseAddPageMachine({ singleForm: { ...exercise, nbSeries: exercise.series.length } })
    );

    const navigate = useNavigate();
    const editExerciseById = useMutation(
        (exo: Exercise) =>
            orm.exercise.upsert(exerciseId, (current) => ({ ...current, ...serializeExercise(exo), id: exerciseId })),
        {
            onSuccess: () => {
                daily.invalidate();
                navigate(routeMap.home);
            },
        }
    );

    useEffect(() => {
        if (!exerciseId) {
            navigate(routeMap.home);
        }

        if (exercise.supersetId) {
            navigate(routeMap.home);
            toasts.warning("Exercises in supersets cannot be edited from this page.");
        }
    }, [exerciseId, navigate, exercise.supersetId]);

    return (
        <ExercisePageLayoutProvider value={service}>
            {exercise && service.initialized && <SingleExerciseForm onSubmit={editExerciseById.mutate} />}
        </ExercisePageLayoutProvider>
    );
};
