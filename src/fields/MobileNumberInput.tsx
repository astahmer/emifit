import {
    Button,
    forwardRef,
    HStack,
    Input,
    InputProps,
    useMergeRefs,
    useNumberInput,
    UseNumberInputProps,
} from "@chakra-ui/react";

export const MobileNumberInput = forwardRef((props: MobileNumberInputProps, ref) => {
    const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } = useNumberInput(props);
    const inputProps = getInputProps(props.inputProps);
    const inputRef = useMergeRefs(ref, inputProps.ref);

    return (
        <HStack maxW="320px">
            <Button size="sm" {...getDecrementButtonProps()}>
                -
            </Button>
            <Input maxW="65px" {...inputProps} ref={inputRef} />
            <Button size="sm" {...getIncrementButtonProps()}>
                +
            </Button>
        </HStack>
    );
});
export type MobileNumberInputProps = UseNumberInputProps & { inputProps?: InputProps };
