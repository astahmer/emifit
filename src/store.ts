import { sortArrayOfObjectByPropFromArray, sortBy } from "@pastable/core";
import { CalendarDate } from "@uselessdev/datepicker";
import { atom, useAtomValue } from "jotai";
import { useQuery, useQueryClient } from "react-query";
import { groupBy } from "./functions/groupBy";
import { createBrowserHistory } from "history";
import { makeId, printDate } from "./functions/utils";
import { orm } from "./orm";
import { Exercise, Program } from "./orm-types";
import { get, update } from "idb-keyval";
import { isToday } from "date-fns";

export const browserHistory = createBrowserHistory({ window });
export const debugModeAtom = atom<boolean>(false);

const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentDailyIdAtom = atom((get) => printDate(get(currentDateAtom)));
export const isDailyTodayAtom = atom((get) => isToday(get(currentDateAtom)));

export const useDaily = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const query = useQuery(["daily", id], () => orm.daily.get(id));
    const invalidate = useDailyInvalidate();

    return { ...query, invalidate };
};

export const useDailyInvalidate = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const queryClient = useQueryClient();

    return () => void queryClient.invalidateQueries(["daily", id]);
};

export const useExercises = () => useQuery<Exercise[]>(orm.exercise.key, () => orm.exercise.get(), { initialData: [] });
export const useExerciseList = () => {
    const list = useExercises().data || [];
    const groupByNames = groupBy(list, "name");
    const mostRecents = Object.keys(groupByNames).map((name) => sortBy(groupByNames[name], "createdAt", "desc")[0]);
    return mostRecents;
};

export const useProgramList = () => {
    const listQ = useQuery<Program[]>(
        orm.program.key,
        async () => {
            const [list, order] = await Promise.all([orm.program.get(), get("programListOrder")]);
            return sortArrayOfObjectByPropFromArray(list || [], "id", order || []);
        },
        { initialData: [] }
    );

    return listQ.data;
};
export const setProgramsOrder = (programIds: string[]) => update("programListOrder", () => programIds);

export const makeExercise = (params: Pick<Exercise, "name" | "tags" | "series"> & { category: string }) =>
    ({
        ...params,
        id: makeId(),
        createdAt: new Date(),
        series: params.series.map((serie) => ({ ...serie, id: makeId() })),
    } as Exercise);
export const makeSerie = (index: number, current = []) => ({ id: makeId(), kg: current[index - 1]?.kg ?? 1, reps: 1 });
