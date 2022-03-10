import { sortBy } from "@pastable/core";
import { CalendarDate } from "@uselessdev/datepicker";
import { atom } from "jotai";
import { useQuery } from "react-query";
import { groupBy } from "./functions/groupBy";
import { createBrowserHistory } from "history";
import { makeId } from "./functions/utils";
import { orm } from "./orm";
import { Exercise, Program } from "./orm-types";

export const browserHistory = createBrowserHistory({ window });

const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentCategoryAtom = atom<string>(null);
export const debugModeAtom = atom<boolean>(false);

export const useExercises = () => useQuery<Exercise[]>(orm.exercise.key, () => orm.exercise.get(), { initialData: [] });
export const useExerciseList = () => {
    const list = useExercises().data || [];
    const groupByNames = groupBy(list, "name");
    const mostRecents = Object.keys(groupByNames).map((name) => sortBy(groupByNames[name], "createdAt", "desc")[0]);
    return mostRecents;
};

export const usePrograms = () => useQuery<Program[]>(orm.program.key, () => orm.program.get(), { initialData: [] });
export const useProgramList = () => usePrograms().data || [];

export const makeExercise = (params: Pick<Exercise, "name" | "tags" | "series"> & { category: string }) =>
    ({
        ...params,
        id: makeId(),
        createdAt: new Date(),
        series: params.series.map((serie) => ({ ...serie, id: makeId() })),
    } as Exercise);
export const makeSerie = (index: number, current = []) => ({ id: makeId(), kg: current[index - 1]?.kg ?? 1, reps: 1 });
