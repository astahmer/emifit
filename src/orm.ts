import { createStore, del, get, keys, update, UseStore } from "idb-keyval";
import { Daily, Exercise, Program } from "./orm-types";

interface Entity {
    id: string;
}

const makeListCrud = <T extends Entity = Entity, Key extends string = string>(key: Key) => {
    const createFn = (value: T) => update<T[]>(key, (current) => [...(current || []), value]);
    const updateFn = (value: T) =>
        update<T[]>(key, (current) => (current || []).map((v) => (v.id === value.id ? value : v)));

    return {
        type: "list",
        key,
        get: () => get<T[]>(key),
        find: async (id: Entity["id"]) => (await get<T[]>(key)).find((v) => v.id === id),
        create: createFn,
        update: updateFn,
        upsert: (value: T) => (value.id ? updateFn(value) : createFn(value)),
        remove: (value: T) => update<T[]>(key, (current) => (current || []).filter((v) => v.id !== value.id)),
        // createMany
        // updateMany
    };
};

const makeDynamicCrud = <T extends Entity = Entity>(store: UseStore) => {
    return {
        type: "dynamic",
        get: (key: string) => get<T>(key, store),
        keys: () => keys(store),
        create: (key: string, value: T) => update<T>(key, () => value, store),
        upsert: (key: string, setterOrUpdate: Partial<T> | ((current: T) => T)) =>
            update<T>(
                key,
                typeof setterOrUpdate === "function"
                    ? setterOrUpdate
                    : (current) => ({ ...current, ...setterOrUpdate }),
                store
            ),
        remove: (key: string) => del(key, store),
    };
};

const dailyStore = createStore("emifit", "daily");

export const orm = {
    exercise: makeListCrud<Exercise, "exerciseList">("exerciseList"),
    program: makeListCrud<Program, "programList">("programList"),
    daily: makeDynamicCrud<Daily>(dailyStore),
};
