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

export const RadioCardButton = (props: ButtonProps) => (
    <Button
        colorScheme="pink"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _focus={{ boxShadow: "outline" }}
        transition="all 0.2s"
        variant="outline"
        {...props}
    />
);

export function RadioCard({
    children,
    getButtonProps,
    ...props
}: UseRadioProps & WithChildren & { getButtonProps?: (state: UseRadioReturn["state"]) => ButtonProps }) {
    const { state, getInputProps, getCheckboxProps } = useRadio(props);

    return (
        <Box as="label">
            <input {...getInputProps()} />
            <RadioCardButton
                as="div"
                {...getCheckboxProps()}
                opacity="0.6"
                _checked={{ opacity: 1 }}
                _disabled={{ opacity: 0.3 }}
                variant={state.isChecked ? "solid" : "outline"}
                {...getButtonProps?.(state)}
            >
                {children}
            </RadioCardButton>
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
