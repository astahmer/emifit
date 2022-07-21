import { SupersetForm } from "@/Exercises/SupersetForm";
import { serializeExercise } from "@/functions/snapshot";
import { orm } from "@/orm";
import { useExerciseList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { useInterpret, useSelector } from "@xstate/react";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ExerciseFormMachineProvider, makeExerciseFormMachine } from "../Exercises/ExerciseFormMachine";

export const ExerciseSupersetEditPage = () => {
    const { supersetId } = useParams<{ supersetId: string }>();
    const exerciseList = useExerciseList({ index: "by-superset", query: supersetId });

    const navigate = useNavigate();
    useEffect(() => {
        if (!supersetId) {
            navigate(-1);
        }
    }, [supersetId, navigate]);

    return exerciseList.length ? <ExerciseSupersetEditForm exerciseList={exerciseList} /> : null;
};

const ExerciseSupersetEditForm = ({ exerciseList }: { exerciseList: Exercise[] }) => {
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
                navigate(-1);
            },
        }
    );

    return (
        <ExerciseFormMachineProvider value={service}>
            {exerciseList?.length && isInitialized && (
                <SupersetForm category={exerciseList[0].category} onSubmit={() => editSupersetExerciseList.mutate()} />
            )}
        </ExerciseFormMachineProvider>
    );
};
