import { sortBy } from "@pastable/core";
import { CalendarDate } from "@uselessdev/datepicker";
import { get, update } from "idb-keyval";
import { atom } from "jotai";
import { nanoid } from "nanoid";
import { useQuery } from "react-query";
import { groupBy } from "./functions/groupBy";
import { format } from "date-fns";
import { createBrowserHistory } from "history";

export const browserHistory = createBrowserHistory({ window });
const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentCategoryAtom = atom<string>(null);
export const debugModeAtom = atom<boolean>(false);

export const useExercises = () => useQuery<Exercise[]>("exerciseList", () => get("exerciseList"), { initialData: [] });
export const useExerciseList = () => {
    const list = useExercises().data || [];
    const groupByNames = groupBy(list, "name");
    const mostRecents = Object.keys(groupByNames).map((name) => sortBy(groupByNames[name], "createdAt", "desc")[0]);
    return mostRecents;
};
export const persistExercise = (exo: Exercise) => update("exerciseList", (current) => [...(current || []), exo]);

export const usePrograms = () => useQuery<Program[]>("programList", () => get("programList"), { initialData: [] });
export const useProgramList = () => usePrograms().data || [];
export const persistProgram = (prog: Program) => update("programList", (current) => [...(current || []), prog]);
export const removeProgram = (prog: Program) =>
    update("programList", (current) => current.filter((p) => p.id !== prog.id));

// date: format(new Date(), "MM/dd/yyyy"),
export const makeId = () => nanoid(10);
export const makeExercise = (params: Pick<Exercise, "name" | "tags" | "series"> & { category: string }) =>
    ({
        ...params,
        id: makeId(),
        createdAt: new Date(),
        series: params.series.map((serie) => ({ ...serie, id: makeId() })),
    } as Exercise);
export const makeSerie = (index: number, current = []) => ({ id: makeId(), kg: current[index - 1]?.kg ?? 1, reps: 1 });
export const makeProgram = (params: Omit<Program, "id">) => ({
    ...params,
    id: makeId(),
    createdAt: new Date(),
    // TODO rename exerciseList
    exercises: params.exercises.map((exo) => ({ ...exo, id: makeId(), madeFromExerciseId: exo.id })),
});

export interface Exercise {
    id: string;
    category: string;
    name: string;
    tags: Tag[];
    series: Serie[];
    createdAt: Date | number;
    madeFromExerciseId?: string;
}
export interface Serie {
    id: string;
    kg: number;
    reps: number;
}

interface Tag {
    id: string;
    label: string;
}

export interface Program {
    id: string;
    name: string;
    category: string;
    exercises: Exercise[]; // TODO rename exerciseList
    // TODO exerciseOrderList: string[]
}
