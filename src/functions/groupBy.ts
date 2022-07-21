import { ObjectLiteral } from "pastable";

export function groupBy<Key extends keyof T, T extends ObjectLiteral>(
    array: T[],
    keyOrGetter: Key
): Record<T[Key], T[]>;
export function groupBy<T, KeyReturnT>(
    array: T[],
    keyOrGetter: (item: T) => KeyReturnT
): KeyReturnT extends string | number ? Record<KeyReturnT, T[]> : never;
export function groupBy<Key, T>(array: T[], keyOrGetter: Key) {
    let kv;
    return array.reduce((r, a) => {
        kv = typeof keyOrGetter === "function" ? keyOrGetter(a) : a[keyOrGetter as unknown as keyof T];
        // @ts-ignore
        r[kv] = [...(r[kv] || []), a];
        return r;
    }, {});
}

export function groupIn<Key extends keyof T, T extends ObjectLiteral>(array: T[], keyOrGetter: Key): Record<T[Key], T>;
export function groupIn<T, KeyReturnT>(
    array: T[],
    keyOrGetter: (item: T) => KeyReturnT
): KeyReturnT extends string | number ? Record<KeyReturnT, T> : never;
export function groupIn<Key, T>(array: T[], keyOrGetter: Key) {
    let kv;
    return array.reduce((r, a) => {
        kv = typeof keyOrGetter === "function" ? keyOrGetter(a) : a[keyOrGetter as unknown as keyof T];
        // @ts-ignore
        r[kv] = a;
        return r;
    }, {});
}
