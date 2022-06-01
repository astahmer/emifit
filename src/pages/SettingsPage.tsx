import { ConfirmationButton } from "@/components/ConfirmationButton";
import { DynamicTable } from "@/components/DynamicTable";
import { HFlex } from "@/components/HFlex";
import { SwitchInput } from "@/components/SwitchInput";
import { loadFromJSON, saveAsJSON } from "@/functions/json";
import { computeSnapshotFromExport, ExportedData, getDatabaseSnapshot } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { orm } from "@/orm";
import { useCategoryList, useDailyList, useExerciseList, useGroupList, useProgramList, useTagList } from "@/orm-hooks";
import { runMigrations } from "@/orm-migrations";
import { Category, Daily, Exercise, Group, Program, Tag } from "@/orm-types";
import { getMostRecentsExerciseById } from "@/orm-utils";
import { ProgramCardExerciseList } from "@/Programs/ProgramCard";
import { debugModeAtom } from "@/store";
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
import { useRef } from "react";
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
            onError: (err) =>
                void toasts.error((err as Error)?.message || "Something unexpected happened while exporting data"),
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
            console.log(orm.version, snapshot.version);
            await Promise.all([
                orm.db.clear(orm.daily.name),
                orm.db.clear(orm.exercise.name),
                orm.db.clear(orm.program.name),
            ]);

            const tx = orm.db.transaction(orm.db.objectStoreNames, "readwrite");
            await runMigrations(orm.db, snapshot.version, orm.version, tx, async () => {
                const exoStore = tx.objectStore(orm.exercise.name);
                const dailyStore = tx.objectStore(orm.daily.name);
                const programStore = tx.objectStore(orm.program.name);

                const exerciseList = snapshot.exerciseList.map((exo) => exoStore.add(exo));
                const dailyList = snapshot.dailyList.map((daily) => dailyStore.add(daily));
                const programList = snapshot.programList.map((program) => programStore.add(program));
                // TODO programListOrder
                await Promise.all([...exerciseList, ...dailyList, ...programList]);
            });
            await tx.done;
        },
        {
            onSuccess: () => {
                void toasts.success("Data imported successfully");
                window.location.reload();
            },
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
                        dailyList={loadMutation.data.dailyList}
                        tagList={loadMutation.data.tagList}
                        categoryList={loadMutation.data.categoryList}
                        groupList={loadMutation.data.groupList}
                    />
                    <ConfirmationButton
                        onConfirm={importMutation.mutate.bind(undefined)}
                        colorScheme="twitter"
                        renderTrigger={(onOpen) => (
                            <Button
                                leftIcon={<Icon as={CheckIcon} />}
                                colorScheme="pink"
                                variant="outline"
                                onClick={onOpen}
                            >
                                Save loaded data
                            </Button>
                        )}
                    />
                </>
            )}
        </Stack>
    );
};

const DebugModeOnly = () => {
    const exerciseList = useExerciseList();
    const programList = useProgramList();
    const dailyList = useDailyList();
    const tagList = useTagList();
    const categoryList = useCategoryList();
    const groupList = useGroupList();

    return (
        <DataAccordions
            exerciseList={exerciseList}
            programList={programList}
            dailyList={dailyList}
            tagList={tagList}
            categoryList={categoryList}
            groupList={groupList}
        />
    );
};

const DataAccordions = ({
    exerciseList,
    programList,
    dailyList,
    tagList,
    categoryList,
    groupList,
}: {
    exerciseList: Exercise[];
    programList: Program[];
    dailyList: Daily[];
    tagList: Tag[];
    categoryList: Category[];
    groupList: Group[];
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
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize="md">
                            Show daily list ({dailyList.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <Box overflow="auto" maxH="600px">
                        <DynamicTable
                            columns={dailyColumns}
                            data={dailyList}
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
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize="md">
                            Show tag list ({tagList.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <Box overflow="auto" maxH="600px">
                        <DynamicTable columns={tagsColumns} data={tagList} isHeaderSticky />
                    </Box>
                </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize="md">
                            Show category list ({categoryList.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <Box overflow="auto" maxH="600px">
                        <DynamicTable columns={categoryColumns} data={categoryList} isHeaderSticky />
                    </Box>
                </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
                <h2>
                    <AccordionButton>
                        <Box flex="1" textAlign="left" fontSize="md">
                            Show group list ({groupList.length})
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                    <Box overflow="auto" maxH="600px">
                        <DynamicTable columns={groupColumns} data={groupList} isHeaderSticky />
                    </Box>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

const tagsColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
    { Header: "group", accessor: "groupId" },
];

const categoryColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
    { Header: "tagList", accessor: "tagList", Cell: (props) => (props.value as Tag[]).map((t) => t.name).join(", ") },
];

const groupColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
];

const exerciseColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
    { Header: "category", accessor: "category" },
    { Header: "sets count", accessor: "series", Cell: (props) => props.value.length },
    { Header: "tags", accessor: "tags", Cell: (props) => (props.value as Tag[]).map((t) => t.name).join(", ") },
];

const programColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
    { Header: "category", accessor: "category" },
    { Header: "exo", accessor: "exerciseList", Cell: (props) => props.value.length },
    {
        Header: "",
        accessor: "__openRow",
        Cell: ({ row }) => (row.isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />),
    },
];

const dailyColumns = [
    { Header: "id", accessor: "id" },
    { Header: "category", accessor: "category" },
    { Header: "exo", accessor: "exerciseList", Cell: (props) => props.value.length },
    { Header: "program", accessor: "programId" },
    {
        Header: "",
        accessor: "__openRow",
        Cell: ({ row }) => (row.isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />),
    },
];
