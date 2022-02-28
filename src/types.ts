export interface WithOnChange<Value = any> {
    onChange: (v: Value) => void;
}

export type StringOrNumber = string | number;
