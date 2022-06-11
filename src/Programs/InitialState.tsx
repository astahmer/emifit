import { HFlex } from "@/components/HFlex";
import { MultiSelect } from "@/components/MultiSelect";
import { useCategoryList, useProgramList } from "@/orm-hooks";
import { Category } from "@/orm-types";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { AddIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Box, Button, Divider, FormLabel, Text } from "@chakra-ui/react";
import { useSelection } from "@pastable/core";
import { ProgramList } from "./ProgramList";

export function InitialState() {
    const send = useProgramInterpret().send;
    const [selection, actions] = useSelection<Category>({ getId: (item) => item.id });
    const categoryList = useCategoryList();
    const programList = useProgramList();

    const categoryListFromProgramList = programList.map((program) => program.category);
    const pickableCategoryList = categoryList.filter((category) => categoryListFromProgramList.includes(category.id));

    const filteredProgramList = selection.length
        ? programList.filter((program) => actions.findById(program.category))
        : programList;

    return (
        <>
            {pickableCategoryList.length > 1 && (
                <Box mt="2">
                    <MultiSelect
                        onChange={actions.set}
                        defaultValue={selection}
                        getValue={(item) => item.id}
                        itemToString={(item) => item.name}
                        items={pickableCategoryList}
                        getButtonProps={() => ({ w: "100%" })}
                        renderButtonText={(selection) => (
                            <Text maxW="100%" textOverflow="ellipsis" overflow="hidden">
                                {selection.length
                                    ? `(${selection.length}) ${selection.map((item) => item.name).join(", ")}`
                                    : "Filter by category"}
                            </Text>
                        )}
                    />
                </Box>
            )}
            {Boolean(filteredProgramList.length) ? (
                <>
                    <HFlex h="100%" overflow="auto">
                        <ProgramList
                            programList={filteredProgramList}
                            onEdit={(program) => send({ type: "StartEditingProgram", program })}
                        />
                    </HFlex>
                    <Box mt="auto">
                        <Button
                            w="100%"
                            mt="4"
                            leftIcon={<AddIcon />}
                            colorScheme="pink"
                            variant="solid"
                            py="4"
                            size="lg"
                            onClick={() => send("StartCreatingProgram")}
                        >
                            Create program
                        </Button>
                    </Box>
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
                <Alert status="info" rounded="full" justifyContent="center">
                    <AlertIcon />
                    No programs yet !
                </Alert>
            </Box>
            <Divider mb="4" />
        </>
    );
};
