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
