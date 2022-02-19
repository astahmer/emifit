import {
    Button,
    ButtonProps,
    FormControl,
    FormErrorMessage,
    FormLabel,
    FormLabelProps,
    Input,
    InputGroup,
    InputProps,
    InputRightElement,
    Textarea,
    TextareaProps,
} from "@chakra-ui/react";
import { MutableRefObject, ReactNode, forwardRef } from "react";
import { FieldError } from "react-hook-form";

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, render, renderLeft, renderRight, formControlRef, error, labelProps, ...props }, ref) => {
        return (
            <FormControl ref={formControlRef} isInvalid={!!error}>
                {label && (
                    <FormLabel htmlFor={props.id} {...labelProps}>
                        {label}
                    </FormLabel>
                )}
                {render ? (
                    render()
                ) : renderLeft || renderRight ? (
                    <InputGroup>
                        {renderLeft?.()}
                        <Input {...props} ref={ref} />
                        {renderRight?.()}
                    </InputGroup>
                ) : (
                    <TextInputBase {...props} ref={ref} />
                )}
                {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
            </FormControl>
        );
    }
);

const appInputProps = {
    // color: "gray.800",
    // variant: "unstyled",
    // bgColor: "#e9e9e9",
    // boxShadow: "0 2px 2px -1px rgb(0 0 0 / 30%)",
    // borderRadius: "3px",
    // padding: "10px 15px",
    // fontSize: "14px",
    // fontWeight: "700",
    // transition: "0.25s",
    // _placeholder: { fontStyle: "italic", color: "gray" },
};

const TextInputBase = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
    <Input {...appInputProps} {...props} ref={ref} />
));

export type TextInputProps = InputProps & {
    label?: string | ReactNode;
    labelProps?: FormLabelProps;
    formControlRef?: MutableRefObject<HTMLDivElement>;
    render?: () => ReactNode;
    renderLeft?: () => ReactNode;
    renderRight?: () => ReactNode;
    error?: { message: string } | FieldError;
};

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(({ children, ...props }, ref) => (
    <TextInput {...(props as any)} render={() => <Textarea {...appInputProps} ref={ref} {...props} />}>
        {children}
    </TextInput>
));

export interface TextareaInputProps extends Pick<TextInputProps, "label" | "error">, TextareaProps {}

export type RightButtonProps = ButtonProps & { label: string; rightElementProps?: InputProps };
export const RightButton = ({ label, rightElementProps, ...props }: RightButtonProps) => {
    return (
        <InputRightElement w="auto" minW="4.5rem" {...rightElementProps}>
            <Button h="1.75rem" size="sm" type="submit" {...props}>
                {label}
            </Button>
        </InputRightElement>
    );
};
