import { get, update } from "idb-keyval";
import { Exercise, Program } from "./orm-types";

type EntitiyName = "exercise" | "program";
interface Entity {
    id: string;
}

const makeEntityCRUD = <T extends Entity = Entity, Key extends string = string>(key: Key) => {
    const createFn = (value: T) => update<T[]>(key, (current) => [...(current || []), value]);
    const updateFn = (value: T) =>
        update<T[]>(key, (current) => (current || []).map((v) => (v.id === value.id ? value : v)));

    return {
        key,
        get: () => get<T[]>(key),
        find: async (id: Entity["id"]) => (await get<T[]>(key)).find((v) => v.id === id),
        create: createFn,
        update: updateFn,
        upsert: (value: T) => {
            return value.id ? updateFn(value) : createFn(value);
        },
        remove: (value: T) => update<T[]>(key, (current) => (current || []).filter((v) => v.id !== value.id)),
        // createMany
        // updateMany
    };
};

export const orm = {
    exercise: makeEntityCRUD<Exercise, "exerciseList">("exerciseList"),
    program: makeEntityCRUD<Program, "programList">("programList"),
};
