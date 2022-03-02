import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { AddIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Box, Button, Divider } from "@chakra-ui/react";

export function InitialState() {
    const programs = [];
    const send = useProgramInterpret().send;

    return (
        <Box d="flex" flexDirection="column" m="auto" mt="100%" alignItems="center">
            {Boolean(!programs.length) && (
                <>
                    <Box m="4">
                        <Alert status="info" rounded="full">
                            <AlertIcon />
                            No programs yet !
                        </Alert>
                    </Box>
                    <Divider mb="4" />
                </>
            )}
            {/* TODO programs card */}
            <Button
                leftIcon={<AddIcon />}
                colorScheme="pink"
                variant="solid"
                py="4"
                mb="4"
                size="lg"
                onClick={() => send("StartCreatingProgram")}
            >
                Add program
            </Button>
        </Box>
    );
}
