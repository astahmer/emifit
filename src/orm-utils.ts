import { sortBy } from "@pastable/core";
import { CalendarDate } from "@uselessdev/datepicker";
import { groupBy } from "./functions/groupBy";
import { makeId, parseDate, printDate } from "./functions/utils";
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

const dailyEntryRegex = /daily\/entry\/(\d{2}-\d{2}-\d{4})/;

export const getDailyIdFromUrl = (url: string) => url.match(dailyEntryRegex)?.[1];
export const parseDailyDateFromUrl = (url: string) => {
    const dailyId = getDailyIdFromUrl(url);
    if (!dailyId) return null;

    return parseDate(dailyId.replaceAll("-", "/"));
};
export const printDailyDate = (date: CalendarDate) => printDate(date).replaceAll("/", "-");
