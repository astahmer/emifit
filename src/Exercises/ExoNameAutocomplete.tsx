import { Combobox, ComboboxProps } from "@/components/Combobox";
import { useExerciseList } from "@/store";
import { FormControl, FormErrorMessage, FormLabel, forwardRef } from "@chakra-ui/react";

export const ExoNameAutocomplete = forwardRef(
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
                    getValue={(item) => item.name}
                    itemToString={(item) => `${item.name}`}
                    items={items}
                    label={(getLabelProps) => <FormLabel {...getLabelProps()}>Exercise name</FormLabel>}
                />

                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        );
    }
);
