import { CategoriesTagsById } from "@/constants";
import { orm } from "@/orm";
import { Daily, Exercise, Program } from "@/orm-types";
import { DailyWithReferences, ExerciseWithReferences, ProgramWithReferences } from "../orm-types";
import { groupIn } from "./groupBy";

export const getDatabaseSnapshot = async () => {
    const [dailyList, programList, exerciseList, programListOrder] = await Promise.all([
        orm.daily.get(),
        orm.program.get(),
        orm.exercise.get(),
        orm.programListOrder.get(),
    ]);

    return { dailyList, programList, exerciseList, programListOrder, version: orm.version };
};

export function computeSnapshotFromExport(data: ExportedData): DatabaseSnapshot {
    const exerciseListById = groupIn(data.exerciseList, "id");
    console.log(exerciseListById);
    return {
        dailyList: data.dailyList.map((d) => ({
            ...d,
            date: new Date(d.date),
            exerciseList: d.exerciseList.map(computeExerciseFromExoId(exerciseListById)),
        })) as Daily[],
        exerciseList: data.exerciseList.map(computeExerciseFromIncompleteExo),
        programList: data.programList.map((p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            exerciseList: p.exerciseList.map(computeExerciseFromExoId(exerciseListById)),
        })) as Program[],
        programListOrder: data.programListOrder,
    };
}

export const serializeDaily = (daily: Daily): DailyWithReferences => ({
    ...daily,
    exerciseList: daily.exerciseList.map((ex) => ex.id),
});

export const serializeExercise = (exercise: Exercise): ExerciseWithReferences => ({
    ...exercise,
    tags: exercise.tags.map((tag) => tag.id),
});

export const serializeProgram = (program: Program): ProgramWithReferences => ({
    ...program,
    exerciseList: program.exerciseList.map((ex) => ex.id),
});

export interface ExportedData {
    dailyList: DailyWithReferences[];
    programList: ProgramWithReferences[];
    exerciseList: ExerciseWithReferences[];
    programListOrder: Program["id"][];
    version: number;
}

export interface DatabaseSnapshot {
    dailyList: Daily[];
    programList: Program[];
    exerciseList: Exercise[];
    programListOrder: Program["id"][];
}

export function computeExerciseFromExoId(exerciseListById: Record<string, ExerciseWithReferences>) {
    return (id: Exercise["id"]): Exercise => {
        const exo = exerciseListById[id];
        !exo && console.log({ id, exerciseListById, exo });
        return { ...exo, tags: exo.tags.map((id) => CategoriesTagsById[id]) };
    };
}
export const computeExerciseFromIncompleteExo = (exo: ExerciseWithReferences): Exercise => ({
    ...exo,
    tags: exo.tags.map((id) => CategoriesTagsById[id]),
});
