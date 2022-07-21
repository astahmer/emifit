import { AnyFunction } from "pastable";

/** Returns a callback that will return true if all functions passed with the same arguments returns true */
export const needsAll =
    <Args = any, Fns extends Function = AnyFunction<Args>>(...fns: Fns[]) =>
    (...args: Args[]) => {
        for (const fn of fns) {
            if (!fn?.(...args)) {
                return false;
            }
        }
        return true;
    };
