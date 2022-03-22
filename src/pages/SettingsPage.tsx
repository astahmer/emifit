import { DynamicTable } from "@/components/DynamicTable";
import { SwitchInput } from "@/components/SwitchInput";
import { Categories, CategoriesTagGroups, CategoriesTags } from "@/constants";
import { debugModeAtom, useExerciseList, useProgramList } from "@/store";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Button, chakra, Flex, Heading, IconButton, Stack } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { useState } from "react";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import { ProgramCardExerciseList } from "@/Programs/ProgramCard";
import { HFlex } from "@/components/HFlex";

export const SettingsPage = () => {
    const [debugMode, setDebugMode] = useAtom(debugModeAtom);

    return (
        <Box id="SettingsPage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Flex>
                <Heading as="h1">Settings</Heading>
                <chakra.span ml="auto">
                    EmiFIT v{import.meta.env.VITE_APP_VERSION} [{import.meta.env.DEV ? "dev" : "prod"}]
                </chakra.span>
            </Flex>
            <Stack mt="8" spacing="4" h="100%" minH="0" overflow="auto">
                <SwitchInput
                    label="Debug mode"
                    onChange={(e) => setDebugMode(e.target.checked)}
                    isChecked={debugMode}
                />
                {/* TODO theme colors */}
                {/* Import/export data */}
                {debugMode && <DevOnly />}
            </Stack>
        </Box>
    );
};

const DevOnly = () => {
    const exerciseList = useExerciseList();
    const programList = useProgramList();

    return (
        <Accordion allowMultiple>
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize="md">
                            Show tag list ({CategoriesTags.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <DynamicTable columns={tagsColumns} data={CategoriesTags} />
                </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize="md">
                            Show exercise list ({exerciseList.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <Box overflow="auto" maxH="600px">
                        <DynamicTable columns={exerciseColumns} data={exerciseList} isHeaderSticky />
                    </Box>
                </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize="md">
                            Show program list ({programList.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <Box overflow="auto" maxH="600px">
                        <DynamicTable
                            columns={programColumns}
                            data={programList}
                            isHeaderSticky
                            getRowProps={(row) => ({ ...row.getToggleRowExpandedProps() })}
                            renderSubRow={({ row }) => (
                                <HFlex pb="4">
                                    <Box>Exercise list:</Box>
                                    <ProgramCardExerciseList program={row.original} />
                                </HFlex>
                            )}
                        />
                    </Box>
                </AccordionPanel>
            </AccordionItem>
            {/* TODO daily entries table */}
        </Accordion>
    );
};

const tagsColumns = [
    { Header: "name", accessor: "label" },
    { Header: "group", accessor: "group" },
];

const exerciseColumns = [
    { Header: "name", accessor: "name" },
    { Header: "category", accessor: "category" },
    { Header: "sets count", accessor: "series", Cell: (props) => props.value.length },
    { Header: "tags", accessor: "tags", Cell: (props) => props.value.map((t) => t.label).join(", ") },
];

const programColumns = [
    { Header: "name", accessor: "name" },
    { Header: "category", accessor: "category" },
    { Header: "exo", accessor: "exerciseList", Cell: (props) => props.value.length },
    {
        Header: "",
        accessor: "__openRow",
        Cell: ({ row }) =>
            // <IconButton
            //     {...row.getToggleRowExpandedProps()}
            //     size="xs"
            //     aria-label="open subrow"
            //     icon={row.isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            // />
            row.isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />,
    },
];
