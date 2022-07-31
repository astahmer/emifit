import { serializeExercise } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { orm } from "@/orm";
import { useExerciseByIdQuery } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { useInterpret, useSelector } from "@xstate/react";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ExerciseFormMachineProvider, makeExerciseFormMachine } from "../Exercises/ExerciseFormMachine";
import { SingleExerciseForm } from "../Exercises/SingleExerciseForm";

export const ExerciseEditPage = () => {
    const { exoId: exerciseId } = useParams<{ exoId: string }>();
    const exerciseQ = useExerciseByIdQuery(exerciseId);
    const exercise = exerciseQ.data;

    const navigate = useNavigate();

    useEffect(() => {
        if (!exerciseId) {
            navigate(-1);
        }

        if (exercise?.supersetId) {
            navigate(-1);
            toasts.warning("Exercises in supersets cannot be edited from this page.");
        }
    }, [exerciseId, navigate, exercise?.supersetId]);

    if (!exercise) return null;

    return <ExerciseEditForm exercise={exercise} />;
};

const ExerciseEditForm = ({ exercise }: { exercise: Exercise }) => {
    const service = useInterpret(() =>
        makeExerciseFormMachine({
            singleForm: exercise ? { ...exercise, nbSeries: exercise.series.length } : undefined,
        })
    );
    const isInitialized = useSelector(service, () => service.initialized);

    const navigate = useNavigate();
    const editExerciseById = useMutation(
        (exo: Exercise) =>
            orm.exercise.upsert(exercise.id, (current) => ({ ...current, ...serializeExercise(exo), id: exercise.id })),
        {
            onSuccess: (_, vars) => {
                navigate(-1);
                toasts.success(`Exercise <${vars.name}> updated !`);
            },
        }
    );

    return (
        <ExerciseFormMachineProvider value={service}>
            {isInitialized && <SingleExerciseForm category={exercise.category} onSubmit={editExerciseById.mutate} />}
        </ExerciseFormMachineProvider>
    );
};
