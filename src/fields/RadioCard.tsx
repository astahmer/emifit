import {
    Box,
    BoxProps,
    Button,
    ButtonProps,
    Flex,
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
import { WithChildren } from "pastable";
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

export function RadioCardPicker({
    renderOptions,
    getStackProps,
    ...props
}: RadioCardPickerProps & { getStackProps?: () => BoxProps }) {
    const { getRootProps, getRadioProps } = useRadioGroup({ ...props, name: "category" });

    return (
        <Stack direction="row" spacing="4" textAlign="center" w="100%" {...getStackProps?.()} {...getRootProps()}>
            {renderOptions(getRadioProps)}
        </Stack>
    );
}

export type RadioCardPickerProps = Omit<UseRadioGroupProps, "name"> & {
    renderOptions?: (getter: UseRadioGroupReturn["getRadioProps"]) => ReactNode;
};
