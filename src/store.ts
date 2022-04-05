import { sortArrayOfObjectByPropFromArray, sortBy } from "@pastable/core";
import { CalendarDate } from "@uselessdev/datepicker";
import { isToday } from "date-fns";
import { createBrowserHistory } from "history";
import { getMany } from "idb-keyval";
import { atom, useAtomValue } from "jotai";
import { useQuery, useQueryClient } from "react-query";
import { groupBy, groupIn } from "./functions/groupBy";
import { computeExerciseFromExoId, computeExerciseFromIncompleteExo } from "./functions/snapshot";
import { makeId, printDate } from "./functions/utils";
import { orm } from "./orm";
import { Exercise, Program } from "./orm-types";
import { AwaitFn } from "./types";

export const browserHistory = createBrowserHistory({ window });
export const debugModeAtom = atom<boolean>(false);
export const showSkeletonsAtom = atom<boolean>(false);

const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentDailyIdAtom = atom((get) => printDate(get(currentDateAtom)));
export const isDailyTodayAtom = atom((get) => isToday(get(currentDateAtom)));

export const useDaily = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const query = useQuery(["daily", id], async () => {
        const daily = await orm.daily.get(id);
        if (!daily) return daily;

        const exerciseList = await orm.exercise.get();
        const exerciseListById = groupIn(exerciseList, "id");
        return { ...daily, exerciseList: daily.exerciseList.map(computeExerciseFromExoId(exerciseListById)) };
    });
    const invalidate = useDailyInvalidate();

    return { ...query, invalidate };
};

export const useDailyInvalidate = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const queryClient = useQueryClient();

    return () => void queryClient.invalidateQueries(["daily", id]);
};

export const useExercises = () =>
    useQuery<Exercise[]>(
        orm.exercise.key,
        async () => {
            const list = await orm.exercise.get();
            return list.map(computeExerciseFromIncompleteExo);
        },
        { initialData: [] }
    );
export const useExerciseList = () => {
    const list = useExercises().data || [];
    const groupByNames = groupBy(list, "name");
    const mostRecents = Object.keys(groupByNames).map((name) => sortBy(groupByNames[name], "createdAt", "desc")[0]);
    return mostRecents;
};

export const useHasProgram = () =>
    Boolean(useQuery([orm.program.key, "hasProgram"], async () => (await orm.program.get())?.length).data);

export const useProgramList = () => {
    const listQ = useQuery<Program[]>(
        orm.program.key,
        async () => {
            const [programList, exerciseList, order] = await (getMany([
                orm.program.key,
                orm.exercise.key,
                orm.programListOrder.key,
            ]) as Promise<
                [
                    AwaitFn<typeof orm.program.get>,
                    AwaitFn<typeof orm.exercise.get>,
                    AwaitFn<typeof orm.programListOrder.get>
                ]
            >);
            const exerciseListById = groupIn(exerciseList, "id");
            return sortArrayOfObjectByPropFromArray(
                (programList || []).map((p) => ({
                    ...p,
                    exerciseList: p.exerciseList.map(computeExerciseFromExoId(exerciseListById)),
                })),
                "id",
                order || []
            );
        },
        { initialData: [] }
    );

    return listQ.data;
};

export const makeExercise = (params: Pick<Exercise, "name" | "tags" | "series"> & { category: string }) =>
    ({
        ...params,
        id: makeId(),
        createdAt: new Date(),
        series: params.series.map((serie) => ({ ...serie, id: makeId() })),
    } as Exercise);
export const makeSerie = (index: number, current = []) => ({ id: makeId(), kg: current[index - 1]?.kg ?? 1, reps: 1 });
