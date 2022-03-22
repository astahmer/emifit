import {
    FormControl,
    FormControlProps,
    FormLabel,
    FormLabelProps,
    Switch,
    SwitchProps,
    forwardRef,
} from "@chakra-ui/react";

export const SwitchInput = forwardRef(
    (
        {
            label,
            labelProps,
            wrapperProps,
            ...props
        }: SwitchInputProps & { wrapperProps?: FormControlProps; labelProps?: FormLabelProps },
        ref
    ) => {
        return (
            <FormControl display="flex" alignItems="center" {...wrapperProps}>
                <Switch colorScheme="pink" alignSelf="flex-end" {...props} ref={ref} id={props.id} />
                <FormLabel ml="2" htmlFor={props.id} mb="0" {...labelProps}>
                    {label}
                </FormLabel>
            </FormControl>
        );
    }
);

export type SwitchInputProps = SwitchProps & {
    label: string;
};
