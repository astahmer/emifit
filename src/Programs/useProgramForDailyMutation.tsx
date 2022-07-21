import { groupIn } from "@/functions/groupBy";
import { serializeDaily } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { makeId } from "@/functions/utils";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Program } from "@/orm-types";
import { currentDailyIdAtom } from "@/store";
import { useAtomValue } from "jotai";
import { useMutation } from "@tanstack/react-query";

export function useProgramForDailyMutation() {
    const dailyId = useAtomValue(currentDailyIdAtom);
    const daily = useCurrentDaily();

    const mutation = useMutation(
        async (selectedProgram: Program) => {
            const program = await orm.program.find(selectedProgram.id);
            const exerciseList = await orm.exercise.get();
            const exerciseListById = groupIn(exerciseList, "id");

            const exerciseCloneList = program.exerciseList
                .map((id) => exerciseListById[id])
                .map((exo) => ({ ...exo, id: makeId(), madeFromExerciseId: exo.id, programId: selectedProgram.id }));

            const tx = orm.exercise.tx("readwrite");
            const insertMany = exerciseCloneList.map((exo) => tx.store.add(exo));

            return Promise.all([
                ...insertMany,
                orm.daily.upsert(dailyId, (current) => ({
                    ...serializeDaily({
                        ...current,
                        programId: program.id,
                        exerciseList: [],
                    }),
                    exerciseList: current.exerciseList.concat(exerciseCloneList.map((exo) => exo.id)),
                })),
                tx.done,
            ]);
        },
        {
            onSuccess: (data, vars) => {
                daily.invalidate();
                toasts.success(`Using program ${vars.name}`);
            },
        }
    );

    return mutation;
}
