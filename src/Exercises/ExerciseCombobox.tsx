import { Combobox, ComboboxProps } from "@/fields/Combobox";
import { MultiCombobox, MultiComboboxProps } from "@/fields/MultiCombobox";
import { Exercise } from "@/orm-types";
import { useExerciseList } from "@/orm-hooks";
import { FormControl, FormErrorMessage, FormLabel, forwardRef } from "@chakra-ui/react";
import { StoreQueryParams } from "@/orm";

export const ExerciseCombobox = forwardRef(
    (
        {
            error,
            getItems,
            params,
            ...props
        }: Omit<ComboboxProps<Exercise>, "items" | "getValue" | "itemToString"> & {
            error?: string;
            getItems?: (items: Exercise[]) => Exercise[];
            params?: StoreQueryParams<"exercise">;
        },
        ref
    ) => {
        const items = useExerciseList(params);

        return (
            <FormControl isInvalid={Boolean(error)}>
                <Combobox
                    label={(getLabelProps) => (
                        <FormLabel {...getLabelProps()}>Exercise name{props.isRequired ? "*" : ""}</FormLabel>
                    )}
                    {...props}
                    ref={ref}
                    getValue={(item: Exercise) => item.id}
                    itemToString={(item) => (item ? `${item.name}` : "")}
                    items={getItems?.(items) || items}
                />

                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        );
    }
);

export const ExerciseListCombobox = forwardRef(
    (
        {
            error,
            params,
            ...props
        }: Omit<MultiComboboxProps, "items" | "getValue" | "itemToString" | "label"> & {
            error?: string;
            params?: StoreQueryParams<"exercise">;
        },
        ref
    ) => {
        const items = useExerciseList(params);

        return (
            <FormControl isInvalid={Boolean(error)}>
                <MultiCombobox<Exercise>
                    {...props}
                    ref={ref}
                    getValue={(item) => item.id}
                    itemToString={(item) => item?.name ?? ""}
                    items={items}
                    label={(getLabelProps) => <FormLabel {...getLabelProps()}>Exercise list</FormLabel>}
                    getSuggestions={({ inputItems, values, selectedItems }) => {
                        const selectedNames = selectedItems.map((item) => item.name);
                        return inputItems.filter(
                            (item) => !values.includes(item.id) && !selectedNames.includes(item.name)
                        );
                    }}
                    placeholder="Search exercise list..."
                />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        );
    }
);
