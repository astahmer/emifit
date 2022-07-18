import { Center, CenterProps, Spinner } from "@chakra-ui/react";

export const CenteredSpinner = (props: CenterProps) => (
    <Center {...props}>
        <Spinner size="xl" />
    </Center>
);
