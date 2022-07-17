import { serializeExercise } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { routeMap } from "@/routes";
import { useInterpret, useSelector } from "@xstate/react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ExerciseFormMachineProvider, makeExerciseFormMachine } from "../Exercises/ExerciseFormMachine";
import { DailySingleExerciseForm } from "../Exercises/SingleExerciseForm";

export const DailyExerciseEditPage = () => {
    const params = useParams<{ dailyId: string; exoId: string }>();
    const exerciseId = params.exoId;

    const daily = useCurrentDaily();
    const exercise = daily?.exerciseList?.find((exo) => exo.id === exerciseId);

    const service = useInterpret(() =>
        makeExerciseFormMachine({ singleForm: { ...exercise, nbSeries: exercise.series.length } })
    );
    const isInitialized = useSelector(service, () => service.initialized);

    const navigate = useNavigate();
    const editExerciseById = useMutation(
        (exo: Exercise) =>
            orm.exercise.upsert(exerciseId, (current) => ({ ...current, ...serializeExercise(exo), id: exerciseId })),
        {
            onSuccess: (_, vars) => {
                daily.invalidate();
                navigate(routeMap.home);
                toasts.success(`Exercise <${vars.name}> updated !`);
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
        <ExerciseFormMachineProvider value={service}>
            {exercise && isInitialized && <DailySingleExerciseForm onSubmit={editExerciseById.mutate} />}
        </ExerciseFormMachineProvider>
    );
};
