import { FormControl, FormLabel, Select, SelectProps, forwardRef } from "@chakra-ui/react";

import { TextInputProps } from "@/components/TextInput";
import { WithChildren } from "@pastable/core";

export const SelectInput = forwardRef(
    ({ id, label, children, ...props }: WithChildren & Pick<TextInputProps, "label"> & SelectProps, ref) => {
        return (
            <FormControl id={id}>
                <FormLabel>{label}</FormLabel>
                <Select {...props} ref={ref}>
                    {children}
                </Select>
            </FormControl>
        );
    }
);
