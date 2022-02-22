import { CheckCircleIcon } from "@chakra-ui/icons";
import { Box, CheckboxState, IconButton, IconButtonProps, useCheckbox, UseCheckboxProps } from "@chakra-ui/react";

export function CheckboxCircle({
    getIconProps,
    ...props
}: UseCheckboxProps & { getIconProps?: (state: CheckboxState) => IconButtonProps }) {
    const { state, getInputProps, getCheckboxProps } = useCheckbox(props);
    const isChecked = state.isChecked;

    return (
        <Box as="label">
            <input {...getInputProps()} hidden />
            <IconButton
                as="div"
                colorScheme={isChecked ? "pink" : "gray"}
                aria-label="checkbox" // TODO
                size="xs"
                icon={isChecked ? <CheckCircleIcon fontSize="x-large" /> : undefined}
                variant="outline"
                rounded="full"
                mr="2"
                {...getCheckboxProps()}
                {...getIconProps?.(state)}
            />
        </Box>
    );
}
