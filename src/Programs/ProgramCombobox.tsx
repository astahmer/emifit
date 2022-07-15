import { Combobox, ComboboxProps } from "@/fields/Combobox";
import { Program } from "@/orm-types";
import { useProgramList } from "@/orm-hooks";
import { FormControl, FormErrorMessage, FormLabel, forwardRef } from "@chakra-ui/react";

export const ProgramCombobox = forwardRef(
    (
        {
            error,
            getItems,
            ...props
        }: Omit<ComboboxProps, "items" | "getValue" | "itemToString" | "label"> & {
            error?: string;
            getItems?: (items: Program[]) => Program[];
        },
        ref
    ) => {
        const items = useProgramList();

        return (
            <FormControl isInvalid={Boolean(error)}>
                <Combobox
                    label={(getLabelProps) => <FormLabel {...getLabelProps()}>Program name</FormLabel>}
                    {...props}
                    ref={ref}
                    getValue={(item: Program) => item.id}
                    itemToString={(item) => (item ? `${item.name}` : "")}
                    items={getItems?.(items) || items}
                />

                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        );
    }
);
