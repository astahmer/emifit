import { sortBy } from "@pastable/core";
import { groupBy } from "./functions/groupBy";
import { makeId } from "./functions/utils";
import { Exercise } from "./orm-types";

export const makeExercise = (params: Pick<Exercise, "name" | "tags" | "series"> & { category: string }) =>
    ({
        ...params,
        id: makeId(),
        createdAt: new Date(),
        series: params.series.map((serie) => ({ ...serie, id: makeId() })),
    } as Exercise);
export const makeSerie = (index: number, current = []) => ({ id: makeId(), kg: current[index - 1]?.kg ?? 1, reps: 1 });

export function getMostRecentsExerciseById(list: Exercise[]) {
    const groupByNames = groupBy(list, "name");
    const mostRecents = Object.keys(groupByNames).map((name) => sortBy(groupByNames[name], "createdAt", "desc")[0]);
    return mostRecents;
}
