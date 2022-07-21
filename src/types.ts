import { SetState } from "pastable";
import tb from "ts-toolbelt";

export interface WithOnChange<Value = any> {
    onChange: (v: Value) => void;
}

export type StringOrNumber = string | number;

export type AwaitFn<T extends tb.Function.Function<any, P>, P = unknown> = tb.Function.Return<T> extends Promise<
    infer R
>
    ? R
    : T;

export type LiteralUnion<T extends U, U = string> = T | (U & {});

export type PickOptional<T, K extends keyof T> = Pick<Partial<T>, K>;
export type UseStateProps<Name extends string, T> = { [key in Name]: T } & {
    [key in `set${Capitalize<Name>}`]: SetState<T>;
};
