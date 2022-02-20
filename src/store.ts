import { get } from "idb-keyval";
import { nanoid } from "nanoid";
import { useQuery } from "react-query";

export const makeId = () => nanoid(10);
export const useExercises = () => useQuery<Exercise[]>("exercises", () => get("exercises"), { initialData: [] });

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
