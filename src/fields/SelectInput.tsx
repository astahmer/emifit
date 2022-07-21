import { FormControl, FormLabel, Select, SelectProps, forwardRef, FormErrorMessage } from "@chakra-ui/react";

import { TextInputProps } from "@/fields/TextInput";
import { WithChildren } from "pastable";

export const SelectInput = forwardRef(
    (
        { id, label, children, error, ...props }: WithChildren & Pick<TextInputProps, "label" | "error"> & SelectProps,
        ref
    ) => {
        return (
            <FormControl id={id} isInvalid={!!error}>
                <FormLabel>{label}</FormLabel>
                <Select {...props} ref={ref}>
                    {children}
                </Select>
                {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
            </FormControl>
        );
    }
);
