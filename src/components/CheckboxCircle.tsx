import { CheckCircleIcon, CheckIcon } from "@chakra-ui/icons";
import { Box, CheckboxState, IconButton, IconButtonProps, useCheckbox, UseCheckboxProps } from "@chakra-ui/react";

export function CheckboxCircle({ getIconProps, ...props }: CheckboxCircleProps) {
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

type CheckboxCircleProps = UseCheckboxProps & { getIconProps?: (state: CheckboxState) => Partial<IconButtonProps> };

const getSquareIconProps = (state: CheckboxState) => ({
    rounded: "none",
    icon: state.isChecked ? <CheckIcon fontSize="lg" /> : undefined,
});
export const CheckboxSquare = (props: CheckboxCircleProps) => (
    <CheckboxCircle getIconProps={getSquareIconProps} {...props} />
);

export const CheckboxButton = ({ isActive, ...props }: IconButtonProps & { isActive: boolean }) => {
    return (
        <IconButton
            colorScheme={isActive ? "pink" : "gray"}
            size="xs"
            icon={isActive ? <CheckCircleIcon fontSize="lg" /> : undefined}
            variant="outline"
            rounded="full"
            mr="2"
            pointerEvents="none"
            {...props}
        />
    );
};
