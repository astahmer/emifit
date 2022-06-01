import { sortArrayOfObjectByPropFromArray } from "@pastable/core";
import { useAtomValue } from "jotai";
import { useQuery, useQueryClient } from "react-query";
import { groupIn } from "./functions/groupBy";
import {
    computeCategoryFromReferences,
    computeExerciseFromExoId,
    computeExerciseFromReferences,
} from "./functions/snapshot";
import { orm, StoreIndex, StoreQueryParams } from "./orm";
import { Category, Daily, DailyWithReferences, Exercise, Program, ProgramWithReferences } from "./orm-types";
import { getMostRecentsExerciseById } from "./orm-utils";
import { currentDailyIdAtom } from "./store";

export const useDailyQuery = (id: DailyWithReferences["id"]) => {
    const query = useQuery(["daily", id], async () => {
        const daily = await orm.daily.find(id);
        if (!daily) return null;

        const [exerciseList, tagList] = await Promise.all([orm.exercise.get(), orm.tag.get()]);
        const [exerciseListById, tagListById] = [groupIn(exerciseList, "id"), groupIn(tagList, "id")];
        return {
            ...daily,
            exerciseList: daily.exerciseList.map(computeExerciseFromExoId(exerciseListById, tagListById)),
        } as Daily;
    });

    return query;
};

export const useCurrentDailyQuery = () => useDailyQuery(useAtomValue(currentDailyIdAtom));
export const useCurrentDaily = () => ({ ...useCurrentDailyQuery().data, invalidate: useCurrentDailyInvalidate() });
export const useCurrentDailyInvalidate = () => {
    const id = useAtomValue(currentDailyIdAtom);
    const queryClient = useQueryClient();

    return () => void queryClient.invalidateQueries(["daily", id]);
};

export const useDailyListQuery = <Index extends StoreIndex<"daily"> = undefined>(
    params: StoreQueryParams<"daily", Index> = {}
) => {
    const query = useQuery(
        ["dailyList"],
        async () => {
            const [list, exerciseList, tagList] = await Promise.all([
                orm.daily.get(params),
                orm.exercise.get(),
                orm.tag.get(),
            ]);
            const [exerciseListById, tagListById] = [groupIn(exerciseList, "id"), groupIn(tagList, "id")];

            return list.map(
                (daily) =>
                    ({
                        ...daily,
                        exerciseList: daily.exerciseList.map(computeExerciseFromExoId(exerciseListById, tagListById)),
                    } as Daily)
            );
        },
        { initialData: [] }
    );

    return query;
};

export const useDailyList = <Index extends StoreIndex<"daily"> = undefined>(
    params: StoreQueryParams<"daily", Index> = {}
) => useDailyListQuery(params).data;

export const useCategoryListQuery = <Index extends StoreIndex<"category"> = undefined>(
    params: StoreQueryParams<"category", Index> = {}
) => {
    const query = useQuery(
        ["categoryList"],
        async () => {
            const [list, tagList] = await Promise.all([orm.category.get(params), orm.tag.get()]);
            const tagListById = groupIn(tagList, "id");

            return list.map((cat) => computeCategoryFromReferences(cat, tagListById));
        },
        { initialData: [] }
    );

    return query;
};

export const useCategoryList = <Index extends StoreIndex<"category"> = undefined>(
    params: StoreQueryParams<"category", Index> = {}
) => useCategoryListQuery(params).data;

export const useCategoryQuery = (id: Category["id"]) => {
    const query = useQuery(
        ["category", id],
        async () => {
            const [category, tagList] = await Promise.all([orm.category.find(id), orm.tag.get()]);
            const tagListById = groupIn(tagList, "id");

            return computeCategoryFromReferences(category, tagListById);
        },
        { initialData: null }
    );

    return query;
};

export const useGroupListQuery = <Index extends StoreIndex<"group"> = undefined>(
    params: StoreQueryParams<"group", Index> = {}
) => {
    const query = useQuery(
        ["groupList"],
        async () => {
            const list = await orm.group.get(params);
            return list;
        },
        { initialData: [] }
    );

    return query;
};

export const useGroupList = <Index extends StoreIndex<"group"> = undefined>(
    params: StoreQueryParams<"group", Index> = {}
) => useGroupListQuery(params).data;

export const useTagListQuery = <Index extends StoreIndex<"tag"> = undefined>(
    params: StoreQueryParams<"tag", Index> = {}
) => {
    const query = useQuery(
        ["tagList"],
        async () => {
            const list = await orm.tag.get(params);
            return list;
        },
        { initialData: [] }
    );

    return query;
};

export const useTagList = <Index extends StoreIndex<"tag"> = undefined>(params: StoreQueryParams<"tag", Index> = {}) =>
    useTagListQuery(params).data;

function useExerciseUnsorted<Index extends StoreIndex<"exercise"> = undefined>(
    params: StoreQueryParams<"exercise", Index> = {}
) {
    return useQuery<Exercise[]>(
        [orm.exercise.name, params],
        async () => {
            const [list, tagList] = await Promise.all([orm.exercise.get(params), orm.tag.get()]);
            const tagListById = groupIn(tagList, "id");
            return list.map((exo) => computeExerciseFromReferences(exo, tagListById));
        },
        { initialData: [] }
    );
}

export function useExerciseList<Index extends StoreIndex<"exercise"> = undefined>(
    params: StoreQueryParams<"exercise", Index> = {}
) {
    const list = useExerciseUnsorted(params).data || [];
    const mostRecents = getMostRecentsExerciseById(list);
    return mostRecents;
}

export const useExerciseListInDailyCategory = () => {
    const daily = useCurrentDaily();
    return useExerciseList({ index: "by-category", query: daily.category });
};

export function useHasProgram<Index extends StoreIndex<"program"> = undefined>(
    params: StoreQueryParams<"program", Index> = {}
) {
    return Boolean(
        useQuery([orm.program.name, "hasProgram", params], async () => {
            const count = await orm.program.count(params);
            return Boolean(count);
        }).data
    );
}

export const useProgramReferenceListUnSorted = () =>
    useQuery<ProgramWithReferences[]>([orm.program.name], () => orm.program.get());

export const useProgramQuery = () => {
    return useQuery<Program[]>(
        [orm.program.name, "list"],
        async () => {
            const [programList, exerciseList, tagList, programListOrder] = await Promise.all([
                orm.program.get(),
                orm.exercise.get(),
                orm.tag.get(),
                orm.programListOrder.get(),
            ]);
            const exerciseListById = groupIn(exerciseList || [], "id");
            const tagListById = groupIn(tagList, "id");
            return sortArrayOfObjectByPropFromArray(
                (programList || []).map((p) => ({
                    ...p,
                    exerciseList: p.exerciseList.map(computeExerciseFromExoId(exerciseListById, tagListById)),
                })),
                "id",
                programListOrder || []
            );
        },
        { initialData: [] }
    );
};

export const useProgramList = () => useProgramQuery().data;
