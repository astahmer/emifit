import { orm } from "@/orm";
import {
    Category,
    CategoryWithReferences,
    Daily,
    Exercise,
    Group,
    GroupWithReferences,
    Program,
    Tag,
    TagWithReferences,
} from "@/orm-types";
import { DailyWithReferences, ExerciseWithReferences, ProgramWithReferences } from "../orm-types";
import { groupIn } from "./groupBy";

export const getDatabaseSnapshot = async () => {
    const [dailyList, programList, exerciseList, categoryList, tagList, groupList, programListOrder] =
        await Promise.all([
            orm.daily.get(),
            orm.program.get(),
            orm.exercise.get(),
            orm.category.get(),
            orm.tag.get(),
            orm.group.get(),
            orm.programListOrder.get(),
        ]);

    return {
        dailyList,
        programList,
        exerciseList,
        categoryList,
        tagList,
        groupList,
        programListOrder,
        version: orm.version,
    };
};

export function computeSnapshotFromExport(data: ExportedData): DatabaseSnapshot {
    const exerciseListById = groupIn(data.exerciseList, "id");
    const tagListById = groupIn(data.tagList, "id");

    return {
        dailyList: data.dailyList.map((d) => ({
            ...d,
            date: new Date(d.date),
            exerciseList: d.exerciseList.map(computeExerciseFromExoId(exerciseListById, tagListById)),
        })) as Daily[],
        exerciseList: data.exerciseList.map((exo) => ({
            ...exo,
            ...computeExerciseFromReferences(exo, tagListById),
            createdAt: new Date(exo.createdAt),
        })),
        programList: data.programList.map((p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            exerciseList: p.exerciseList.map(computeExerciseFromExoId(exerciseListById, tagListById)),
        })) as Program[],
        tagList: data.tagList,
        categoryList: data.categoryList.map((cat) => computeCategoryFromReferences(cat, tagListById)),
        groupList: data.groupList,
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
    tagList: TagWithReferences[];
    groupList: GroupWithReferences[];
    categoryList: CategoryWithReferences[];
    programListOrder: Program["id"][];
    version: number;
}

export interface DatabaseSnapshot {
    dailyList: Daily[];
    programList: Program[];
    exerciseList: Exercise[];
    tagList: Tag[];
    categoryList: Category[];
    groupList: Group[];
    programListOrder: Program["id"][];
}

export function computeExerciseFromExoId(
    exerciseListById: Record<string, ExerciseWithReferences>,
    tagListById: Record<string, Tag>
) {
    return (id: Exercise["id"]): Exercise => {
        const exo = exerciseListById[id];
        return {
            ...exo,
            createdAt: new Date(exo.createdAt),
            tags: exo.tags.map((id) => tagListById[id]).filter(Boolean),
        };
    };
}
export const computeExerciseFromReferences = (
    exo: ExerciseWithReferences,
    tagListById: Record<string, Tag>
): Exercise => ({
    ...exo,
    createdAt: new Date(exo.createdAt),
    tags: exo.tags.map((id) => tagListById[id]).filter(Boolean),
});

export const computeCategoryFromReferences = (
    cat: CategoryWithReferences,
    tagListById: Record<string, Tag>
): Category => ({
    ...cat,
    tagList: cat.tagList.map((id) => tagListById[id]).filter(Boolean),
});
