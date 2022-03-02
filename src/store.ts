import { sortBy } from "@pastable/core";
import { CalendarDate } from "@uselessdev/datepicker";
import { get } from "idb-keyval";
import { atom } from "jotai";
import { nanoid } from "nanoid";
import { useQuery } from "react-query";
import { groupBy } from "./functions/groupBy";

export const makeId = () => nanoid(10);
export const useExercises = () => useQuery<Exercise[]>("exerciseList", () => get("exerciseList"), { initialData: [] });
export const useExerciseList = () => {
    const list = useExercises().data || [];
    const groupByNames = groupBy(list, "name");
    const mostRecents = Object.keys(groupByNames).map((name) => sortBy(groupByNames[name], "datetime", "desc")[0]);
    return mostRecents;
};

const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentCategoryAtom = atom<string>(null);

export interface Exercise {
    id: string;
    date: string;
    datetime: Date | number;
    series: Serie[];
    tags: Tag[];
    category: string;
    name: string;
    nbSeries: number;
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
    exercises: Exercise[];
}
