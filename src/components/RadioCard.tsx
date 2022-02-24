import {
    Box,
    Button,
    ButtonProps,
    Stack,
    useRadio,
    useRadioGroup,
    UseRadioGroupProps,
    UseRadioGroupReturn,
    UseRadioProps,
    UseRadioReturn,
} from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { ReactNode } from "react";

export function RadioCard({
    children,
    getButtonProps,
    ...props
}: UseRadioProps & WithChildren & { getButtonProps?: (state: UseRadioReturn["state"]) => ButtonProps }) {
    const { state, getInputProps, getCheckboxProps } = useRadio(props);

    return (
        <Box as="label">
            <input {...getInputProps()} />
            <Button
                {...getCheckboxProps()}
                as="div"
                colorScheme="pink"
                borderWidth="1px"
                borderRadius="md"
                boxShadow="md"
                _focus={{ boxShadow: "outline" }}
                opacity={!state.isChecked ? 0.5 : 1}
                transition="all 0.2s"
                variant={state.isChecked ? "solid" : "outline"}
                {...getButtonProps?.(state)}
            >
                {children}
            </Button>
        </Box>
    );
}

export function RadioCardPicker({ renderOptions, onChange, isDisabled }: RadioCardPickerProps) {
    const { getRootProps, getRadioProps } = useRadioGroup({ name: "category", onChange, isDisabled });

    return (
        <Stack direction="row" {...getRootProps()} textAlign="center" justifyContent="space-around" w="100%">
            {renderOptions(getRadioProps)}
        </Stack>
    );
}

export type RadioCardPickerProps = Pick<UseRadioGroupProps, "onChange" | "isDisabled"> & {
    renderOptions?: (getter: UseRadioGroupReturn["getRadioProps"]) => ReactNode;
};
