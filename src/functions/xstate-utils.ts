import { ObjectLiteral } from "pastable";
import { State, AnyState } from "xstate";

export const getStatesPathValue = (state: AnyState) => {
    const paths = state.toStrings();
    const rootPaths = paths.filter((path) => !path.includes("."));
    const maxNestingLevel = rootPaths
        .map((rootPath) =>
            paths
                .filter((path) => path.startsWith(rootPath))
                .map((path) => path.split(".").length)
                .reduce((acc, current) => Math.max(acc, current), 0)
        )
        .reduce((acc, max, index) => ({ ...acc, [rootPaths[index]]: max }), {});
    const PathsValue = paths
        .filter((path) => path.split(".").length === maxNestingLevel[rootPaths.find((root) => path.startsWith(root))])
        .sort();

    return PathsValue;
};
export const printStatesPathValue = (state: AnyState) => {
    const paths = getStatesPathValue(state);
    return paths.length === 1 ? paths[0] : paths.join(" / ");
};

export const parseStateValue = (stateStr: string) => {
    if (!stateStr) return;

    try {
        const parsed = JSON.parse(stateStr);
        return State.create(parsed);
    } catch (error) {
        return;
    }
};
export const areEqualStateValuePath = (a: AnyState, b: AnyState) => getStatesPathValue(a) === getStatesPathValue(b);

// https://xstate.js.org/docs/guides/states.html#state-meta-data
export function mergeMeta<Meta extends ObjectLiteral>(meta: Meta) {
    return Object.keys(meta).reduce((acc, key) => {
        const value = meta[key];

        // Assuming each meta value is an object
        Object.assign(acc, value);

        return acc;
    }, {} as Meta);
}
