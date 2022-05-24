import { Box, Button, Center, chakra, Stack, useClipboard } from "@chakra-ui/react";
import { FallbackProps } from "react-error-boundary";

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    const { hasCopied, onCopy } = useClipboard(error?.stack);

    return (
        <Center boxSize="full">
            <Stack maxW="70%">
                <chakra.h1 fontSize="2xl">Something went wrong</chakra.h1>
                <chakra.h2 fontSize="lg" fontWeight="bold" color="pink.300">
                    {error.name}: {`<${error.message}>`}
                </chakra.h2>
                <details>
                    <chakra.pre w="100%" overflow="auto" fontSize="smaller">
                        {error.stack}
                    </chakra.pre>
                </details>
                <Button onClick={() => onCopy()} colorScheme="pink">
                    {hasCopied ? "Copied ! ✅" : "Copy stack trace"}
                </Button>
                <Box>
                    <Stack mt="8">
                        <Button onClick={() => resetErrorBoundary()} colorScheme="pink" variant="outline">
                            Reset page
                        </Button>
                        <Button onClick={() => window.location.reload()} colorScheme="pink" variant="outline">
                            Or refresh if reset is not working
                        </Button>
                    </Stack>
                </Box>
            </Stack>
        </Center>
    );
};
