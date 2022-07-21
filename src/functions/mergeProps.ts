import { callAll, ObjectLiteral } from "pastable";

export const mergeProps = <Left extends ObjectLiteral, Right extends Partial<Left & {}>>(left: Left, right: Right) => {
    const result = { ...left, ...right };
    for (const key in result) {
        if (typeof left[key] === "function" && typeof right[key] === "function") {
            (result as any)[key] = callAll(left[key], right[key]);
        }
    }
    return result;
};
