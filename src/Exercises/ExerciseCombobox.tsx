import { Combobox, ComboboxProps } from "@/components/Combobox";
import { MultiCombobox, MultiComboboxProps } from "@/components/MultiCombobox";
import { Exercise } from "@/orm-types";
import { useExerciseList } from "@/store";
import { FormControl, FormErrorMessage, FormLabel, forwardRef } from "@chakra-ui/react";

export const ExerciseCombobox = forwardRef(
    (
        { error, ...props }: Omit<ComboboxProps, "items" | "getValue" | "itemToString" | "label"> & { error?: string },
        ref
    ) => {
        const items = useExerciseList();

        return (
            <FormControl isInvalid={Boolean(error)}>
                <Combobox
                    {...props}
                    ref={ref}
                    getValue={(item: Exercise) => item.id}
                    itemToString={(item) => (item ? `${item.name}` : "")}
                    items={items}
                    label={(getLabelProps) => <FormLabel {...getLabelProps()}>Exercise name</FormLabel>}
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
            ...props
        }: Omit<MultiComboboxProps, "items" | "getValue" | "itemToString" | "label"> & { error?: string },
        ref
    ) => {
        const items = useExerciseList();

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
