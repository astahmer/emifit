import { HFlex } from "@/components/HFlex";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { useProgramList } from "@/store";
import { AddIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Box, Button, Divider } from "@chakra-ui/react";
import { ProgramList } from "./ProgramList";

export function InitialState() {
    const send = useProgramInterpret().send;
    const programs = useProgramList();
    console.log(programs);

    return (
        <>
            {Boolean(programs.length) ? (
                <>
                    <HFlex h="100%" overflow="auto">
                        <ProgramList onEdit={(program) => send({ type: "StartEditingProgram", program })} />
                    </HFlex>
                    <Button
                        mt="auto"
                        leftIcon={<AddIcon />}
                        colorScheme="pink"
                        variant="solid"
                        py="4"
                        size="lg"
                        onClick={() => send("StartCreatingProgram")}
                    >
                        Create program
                    </Button>
                </>
            ) : (
                <Box d="flex" flexDirection="column" m="auto" mt="auto" alignItems="center">
                    <EmptyProgramList />
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme="pink"
                        variant="solid"
                        py="4"
                        mb="4"
                        size="lg"
                        onClick={() => send("StartCreatingProgram")}
                    >
                        Create program
                    </Button>
                </Box>
            )}
        </>
    );
}

const EmptyProgramList = () => {
    return (
        <>
            <Box m="4">
                <Alert status="info" rounded="full">
                    <AlertIcon />
                    No programs yet !
                </Alert>
            </Box>
            <Divider mb="4" />
        </>
    );
};
