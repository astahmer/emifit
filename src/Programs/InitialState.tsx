import { FloatingButton } from "@/components/FloatingButton";
import { HFlex } from "@/components/HFlex";
import { MultiSelect } from "@/fields/MultiSelect";
import { SortByDirection } from "@/components/SortByIconButton";
import { useCategoryList, useProgramList } from "@/orm-hooks";
import { Category, Program } from "@/orm-types";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Box, Button, Divider, FormLabel, IconButton, Text } from "@chakra-ui/react";
import { sortBy, useSelection } from "@pastable/core";
import { useState } from "react";
import { ProgramCombobox } from "./ProgramCombobox";
import { ProgramList } from "./ProgramList";

export function InitialState({ sortByDirection }: { sortByDirection: SortByDirection }) {
    const send = useProgramInterpret().send;
    const [selection, actions] = useSelection<Category>({ getId: (item) => item.id });
    const categoryList = useCategoryList();
    const programList = useProgramList();

    const categoryListFromProgramList = programList.map((program) => program.category);
    const pickableCategoryList = categoryList.filter((category) => categoryListFromProgramList.includes(category.id));
    const [byName, setByName] = useState<Program>();

    let filteredProgramList = programList;

    if (selection.length) {
        filteredProgramList = programList.filter((program) => actions.findById(program.category));
    }
    if (byName) {
        filteredProgramList = programList.filter((program) => program.name.toLowerCase() === byName.name.toLowerCase());
    }
    if (sortByDirection) {
        filteredProgramList = sortBy(filteredProgramList, "name", sortByDirection);
    }

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
                    <FloatingButton
                        containerProps={{ bottom: 20, right: 5 }}
                        renderButton={(props) => (
                            <IconButton
                                aria-label="Search"
                                icon={<SearchIcon />}
                                colorScheme="pink"
                                rounded="full"
                                size="lg"
                                onClick={props.onOpen}
                            />
                        )}
                        renderModalContent={() => (
                            <Box py="4">
                                <ProgramCombobox
                                    initialSelectedItem={byName}
                                    defaultValue={byName?.name}
                                    onSelectedItemChange={(changes) => setByName(changes.selectedItem)}
                                    getItems={(items) => filteredProgramList}
                                    label={() => null}
                                    placeholder="Search for a program by name"
                                />
                            </Box>
                        )}
                    />
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
