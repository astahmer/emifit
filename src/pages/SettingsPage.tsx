import { DynamicTable } from "@/components/DynamicTable";
import { HFlex } from "@/components/HFlex";
import { SwitchInput } from "@/components/SwitchInput";
import { CategoriesTags } from "@/constants";
import { loadFromJSON, saveAsJSON } from "@/functions/json";
import { computeSnapshotFromExport, ExportedData, getDatabaseSnapshot } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { orm } from "@/orm";
import { Exercise, Program } from "@/orm-types";
import { ProgramCardExerciseList } from "@/Programs/ProgramCard";
import { debugModeAtom, getMostRecentsExerciseById, useExerciseList, useProgramList } from "@/store";
import { AwaitFn } from "@/types";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    chakra,
    Flex,
    Heading,
    Icon,
    Stack,
} from "@chakra-ui/react";
import { useAtom } from "jotai";
import { ReactNode, useRef } from "react";
import { BiExport, BiImport } from "react-icons/bi";
import { useMutation } from "react-query";

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
                {/* TODO theme colors */}
                <ExportImportData />
                <SwitchInput
                    id="debugModeSwitch"
                    label="Debug mode"
                    onChange={(e) => setDebugMode(e.target.checked)}
                    isChecked={debugMode}
                />
                {debugMode && <DebugModeOnly />}
            </Stack>
        </Box>
    );
};

const ExportImportData = () => {
    const snapshotRef = useRef<null | AwaitFn<typeof getDatabaseSnapshot>>(null);
    const exportMutation = useMutation(
        async () => {
            const snapshot = await getDatabaseSnapshot();
            return saveAsJSON(JSON.stringify(snapshot, null, 0));
        },
        {
            onSuccess: () => void toasts.success("Data exported successfully"),
            onError: () => void toasts.error("Something unexpected happened while exporting data"),
        }
    );

    const loadMutation = useMutation(
        async () => {
            const imported = await loadFromJSON<ExportedData>();
            snapshotRef.current = imported;
            return computeSnapshotFromExport(imported);
        },
        {
            onSuccess: () => void toasts.success("Data loaded successfully"),
            onError: (err) => {
                // @ts-ignore
                if (err.message === "The user aborted a request.") return;
                void toasts.error("Something unexpected happened while loading data");
            },
        }
    );
    const importMutation = useMutation(
        async () => {
            const snapshot = snapshotRef.current;
            const tx = orm.db.transaction(orm.db.objectStoreNames, "readwrite");

            const exoStore = tx.objectStore(orm.exercise.name);
            const dailyStore = tx.objectStore(orm.daily.name);
            const programStore = tx.objectStore(orm.program.name);

            const exerciseList = snapshot.exerciseList.map((exo) => exoStore.add(exo));
            const dailyList = snapshot.dailyList.map((daily) => dailyStore.add(daily));
            const programList = snapshot.programList.map((daily) => programStore.add(daily));

            // TODO programListOrder
            return Promise.all([...exerciseList, ...dailyList, ...programList, tx.done]);
        },
        {
            onSuccess: () => void toasts.success("Data imported successfully"),
            onError: () => void toasts.error("Something unexpected happened while importing data"),
        }
    );

    return (
        <Stack>
            <Stack direction="row">
                <Button
                    leftIcon={<Icon as={BiImport} />}
                    colorScheme="pink"
                    onClick={exportMutation.mutate.bind(undefined)}
                >
                    Export
                </Button>
                <Button
                    leftIcon={<Icon as={BiExport} />}
                    colorScheme="pink"
                    variant="outline"
                    onClick={loadMutation.mutate.bind(undefined)}
                >
                    Import
                </Button>
            </Stack>
            {loadMutation.data && (
                <>
                    <Heading as="h4" fontSize="md">
                        Loaded data preview from import
                    </Heading>
                    <DataAccordions
                        exerciseList={getMostRecentsExerciseById(loadMutation.data.exerciseList)}
                        programList={loadMutation.data.programList}
                        // dailyList={loadMutation.data.dailyList}
                    />
                    <Button
                        leftIcon={<Icon as={CheckIcon} />}
                        colorScheme="pink"
                        variant="outline"
                        onClick={importMutation.mutate.bind(undefined)}
                    >
                        Save loaded data
                    </Button>
                </>
            )}
        </Stack>
    );
};

const DebugModeOnly = () => {
    const exerciseList = useExerciseList();
    const programList = useProgramList();

    return (
        <>
            <DataAccordions
                exerciseList={exerciseList}
                programList={programList}
                // dailyList={loadMutation.data.dailyList}
            >
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
            </DataAccordions>
        </>
    );
};

const DataAccordions = ({
    exerciseList,
    programList,
    children,
}: {
    exerciseList: Exercise[];
    programList: Program[];
    // dailyList: Program[]; // TODO
    children?: ReactNode;
}) => {
    return (
        <Accordion allowMultiple>
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
            {children}
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
        Cell: ({ row }) => (row.isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />),
    },
];
