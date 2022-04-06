import { TextInputProps } from "@/components/TextInput";
import { CheckCircleIcon, CheckIcon } from "@chakra-ui/icons";
import {
    Box,
    CheckboxState,
    FormControl,
    FormLabel,
    forwardRef,
    IconButton,
    IconButtonProps,
    useCheckbox,
    UseCheckboxProps,
} from "@chakra-ui/react";

export function CheckboxCircle({ getIconProps, checkboxRef, ...props }: CheckboxCircleProps) {
    const { state, getInputProps, getCheckboxProps } = useCheckbox(props);
    const isChecked = state.isChecked;

    return (
        <Box as="label">
            <input {...getInputProps()} hidden ref={checkboxRef} />
            <IconButton
                as="div"
                colorScheme={isChecked ? "pink" : "gray"}
                aria-label="checkbox" // TODO
                size="xs"
                icon={isChecked ? <CheckCircleIcon fontSize="x-large" /> : undefined}
                variant="outline"
                rounded="full"
                {...getCheckboxProps()}
                {...getIconProps?.(state)}
            />
        </Box>
    );
}

type CheckboxCircleProps = UseCheckboxProps & {
    getIconProps?: (state: CheckboxState) => Partial<IconButtonProps>;
    checkboxRef?: React.Ref<HTMLInputElement>;
};

const getSquareIconProps = (state: CheckboxState) => ({
    rounded: "none",
    icon: state.isChecked ? <CheckIcon fontSize="lg" /> : undefined,
});
export const CheckboxSquare = ({ getIconProps, ...props }: CheckboxCircleProps) => (
    <CheckboxCircle getIconProps={(s) => ({ ...getIconProps?.(s), ...getSquareIconProps(s) })} {...props} />
);

export const CheckboxButton = ({ isActive, ...props }: IconButtonProps & { isActive: boolean }) => {
    return (
        <IconButton
            opacity={isActive ? "1" : "0"}
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

export const CheckboxInput = forwardRef(
    ({ id, label, ...props }: Pick<TextInputProps, "label"> & CheckboxCircleProps, ref) => {
        return (
            <FormControl id={id}>
                <FormLabel>{label}</FormLabel>
                <CheckboxSquare {...props} checkboxRef={ref} />
            </FormControl>
        );
    }
);
