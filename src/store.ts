import { nanoid } from "nanoid";
import { atom } from "jotai";
import { CalendarDate } from "@uselessdev/datepicker";

import * as Y from "yjs";
import { proxy, useSnapshot } from "valtio";
import { bindProxyAndYMap, bindProxyAndYArray } from "valtio-yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { ObjectLiteral } from "@pastable/core";

const ydoc = new Y.Doc();

// this allows you to instantly get the (cached) documents data
const indexeddbProvider = new IndexeddbPersistence("emifit", ydoc);
indexeddbProvider.on("synced", (data: typeof indexeddbProvider) => {
    console.log("loaded data from indexed db:", data.db.name, data.db.version);
});

export const makeYmapProxy = <Obj extends ObjectLiteral>(name: string, obj: Obj) => {
    const ymap = ydoc.getMap(name);
    const state = proxy(obj);
    bindProxyAndYMap(state, ymap);
    return state;
};
export const makeYArrayProxy = <Item>(name: string, arr: Array<Item>) => {
    const yarr = ydoc.getArray(name);
    const state = proxy(arr);
    bindProxyAndYArray(state, yarr);
    return state;
};
export const store = {
    programs: makeYArrayProxy<Program>("programs", []),
    exercises: makeYArrayProxy<Exercise>("exercises", []),
    // TODO categories/tags ?
};

export const useExerciseList = () => useSnapshot(store.exercises);

export const makeId = () => nanoid(10);
// export const useExercises = () => useQuery<Exercise[]>("exercises", () => get("exercises"), { initialData: [] });
// export const useExerciseList = () => useExercises().data || [];

const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentCategoryAtom = atom<string>(null);

export interface Exercise {
    id: string;
    date: string;
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
