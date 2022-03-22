import { Combobox, ComboboxProps } from "@/components/Combobox";
import { Program } from "@/orm-types";
import { useProgramList } from "@/store";
import { FormControl, FormErrorMessage, FormLabel, forwardRef } from "@chakra-ui/react";

export const ProgramCombobox = forwardRef(
    (
        { error, ...props }: Omit<ComboboxProps, "items" | "getValue" | "itemToString" | "label"> & { error?: string },
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
                    items={items}
                />

                {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        );
    }
);
