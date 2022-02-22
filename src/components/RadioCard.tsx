import { Box, Button, useRadio, UseRadioProps } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";

export function RadioCard({ children, ...props }: UseRadioProps & WithChildren) {
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
            >
                {children}
            </Button>
        </Box>
    );
}
