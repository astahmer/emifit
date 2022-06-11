import {
    Box,
    BoxProps,
    Button,
    ButtonProps,
    forwardRef,
    HTMLChakraProps,
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

export type RadioCardProps = UseRadioProps &
    WithChildren & {
        getButtonProps?: (state: UseRadioReturn["state"]) => ButtonProps;
        getLabelProps?: (state: UseRadioReturn["state"]) => HTMLChakraProps<"label">;
    };

export const RadioCard = forwardRef(({ children, getButtonProps, getLabelProps, ...props }: RadioCardProps, ref) => {
    const { state, getInputProps, getCheckboxProps } = useRadio(props);

    return (
        <Box {...(getLabelProps?.(state) as any)} as="label" ref={ref}>
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
});

export function RadioCardPicker({ renderOptions, ...props }: RadioCardPickerProps) {
    const { getRootProps, getRadioProps } = useRadioGroup({ ...props, name: "category" });

    return (
        <Stack direction="row" {...getRootProps()} textAlign="center" justifyContent="space-around" w="100%">
            {renderOptions(getRadioProps)}
        </Stack>
    );
}

export type RadioCardPickerProps = Omit<UseRadioGroupProps, "name"> & {
    renderOptions?: (getter: UseRadioGroupReturn["getRadioProps"]) => ReactNode;
};
