import { get } from "idb-keyval";
import { nanoid } from "nanoid";
import { useQuery } from "react-query";
import { atom } from "jotai";
import { CalendarDate } from "@uselessdev/datepicker";

export const makeId = () => nanoid(10);
export const useExercises = () => useQuery<Exercise[]>("exercises", () => get("exercises"), { initialData: [] });

const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);

export interface Exercise {
    id: string;
    date: string;
    series: Serie[];
    tag: string;
    category: string;
    name: string;
    nbSeries: number;
}
export interface Serie {
    id: string;
    kg: number;
    reps: number;
}
