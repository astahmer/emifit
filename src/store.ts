import { sortArrayOfObjectByPropFromArray, sortBy } from "@pastable/core";
import { CalendarDate } from "@uselessdev/datepicker";
import { isToday } from "date-fns";
import { createBrowserHistory } from "history";
import { atom, useAtomValue } from "jotai";
import { useQuery, useQueryClient } from "react-query";
import { groupBy, groupIn } from "./functions/groupBy";
import { computeExerciseFromExoId, computeExerciseFromIncompleteExo } from "./functions/snapshot";
import { makeId, printDate } from "./functions/utils";
import { orm } from "./orm";
import { Daily, Exercise, Program, ProgramWithReferences } from "./orm-types";

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
        const daily = await orm.daily.find(id);
        if (!daily) return null;

        const exerciseList = await orm.exercise.get();
        const exerciseListById = groupIn(exerciseList, "id");
        return { ...daily, exerciseList: daily.exerciseList.map(computeExerciseFromExoId(exerciseListById)) } as Daily;
    });
    const invalidate = useDailyInvalidate();

    return { ...query, invalidate };
};

export const useDailyInvalidate = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const queryClient = useQueryClient();

    return () => void queryClient.invalidateQueries(["daily", id]);
};

const useExerciseUnsorted = () =>
    useQuery<Exercise[]>(
        orm.exercise.name,
        async () => {
            const list = await orm.exercise.get();
            return list.map(computeExerciseFromIncompleteExo);
        },
        { initialData: [] }
    );
export const useExerciseList = () => {
    const list = useExerciseUnsorted().data || [];
    const mostRecents = getMostRecentsExerciseById(list);
    return mostRecents;
};

export const useHasProgram = () =>
    Boolean(useQuery([orm.program.name, "hasProgram"], async () => Boolean(await orm.program.count())).data);

export const useProgramReferenceListUnSorted = () =>
    useQuery<ProgramWithReferences[]>([orm.program.name], () => orm.program.get());

export const useProgramQuery = () => {
    return useQuery<Program[]>(
        [orm.program.name, "list"],
        async () => {
            const [programList, exerciseList, programListOrder] = await Promise.all([
                orm.program.get(),
                orm.exercise.get(),
                orm.programListOrder.get(),
            ]);
            const exerciseListById = groupIn(exerciseList || [], "id");
            return sortArrayOfObjectByPropFromArray(
                (programList || []).map((p) => ({
                    ...p,
                    exerciseList: p.exerciseList.map(computeExerciseFromExoId(exerciseListById)),
                })),
                "id",
                programListOrder || []
            );
        },
        { initialData: [] }
    );
};

export const useProgramList = () => useProgramQuery().data;

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
