import { ConfirmationButton } from "@/components/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { DynamicTable } from "@/components/DynamicTable";
import { HFlex } from "@/components/HFlex";
import { MultiSelect } from "@/components/MultiSelect";
import { SelectInput } from "@/components/SelectInput";
import { SwitchInput } from "@/components/SwitchInput";
import { TextInput } from "@/components/TextInput";
import { TagMultiSelect } from "@/Exercises/TagMultiSelect";
import { loadFromJSON, saveAsJSON } from "@/functions/json";
import { mergeProps } from "@/functions/mergeProps";
import { computeSnapshotFromExport, ExportedData, getDatabaseSnapshot } from "@/functions/snapshot";
import { onError, toasts } from "@/functions/toasts";
import { requiredRule, slugify } from "@/functions/utils";
import { orm } from "@/orm";
import { useCategoryList, useDailyList, useExerciseList, useGroupList, useProgramList, useTagList } from "@/orm-hooks";
import { runMigrations } from "@/orm-migrations";
import { Category, Daily, Exercise, Group, Program, Tag } from "@/orm-types";
import { getMostRecentsExerciseById } from "@/orm-utils";
import { ProgramCardExerciseList } from "@/Programs/ProgramCard";
import { debugModeAtom } from "@/store";
import { AwaitFn } from "@/types";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
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
    FormLabel,
    Heading,
    Icon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    Tag as ChakraTag,
    Text,
} from "@chakra-ui/react";
import { getDiff } from "@pastable/core";
import { useAtom, useAtomValue } from "jotai";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { BiExport, BiImport } from "react-icons/bi";
import { useMutation, useQueryClient } from "react-query";
import { PersistModal } from "../components/PersistModal";

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
            <Flex flexDirection="column" mt="8" h="100%" minH="0" overflow="auto">
                {/* TODO theme colors */}
                <EditableList />
                <Box mt="auto">
                    <Stack spacing="4" mt="8" pt="8">
                        <ExportImportData />
                        <Box d="flex">
                            <SwitchInput
                                ml="auto"
                                id="debugModeSwitch"
                                label="Debug mode"
                                onChange={(e) => setDebugMode(e.target.checked)}
                                isChecked={debugMode}
                            />
                        </Box>
                    </Stack>
                </Box>
                {debugMode && (
                    <Box mt="4">
                        <DebugModeOnly />
                    </Box>
                )}
            </Flex>
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

    const isDebugMode = useAtomValue(debugModeAtom);

    return (
        <Stack>
            <Stack direction="row" ml="auto">
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
                        showIdColumn={isDebugMode}
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

    return <DataAccordions exerciseList={exerciseList} programList={programList} dailyList={dailyList} showIdColumn />;
};

const EditableList = () => {
    const tagList = useTagList();
    const categoryList = useCategoryList();
    const groupList = useGroupList();
    const isDebugMode = useAtomValue(debugModeAtom);

    return (
        <DataAccordions
            tagList={tagList}
            categoryList={categoryList}
            groupList={groupList}
            withActions
            showIdColumn={isDebugMode}
        />
    );
};

const DataAccordions = ({
    withActions,
    exerciseList,
    programList,
    dailyList,
    tagList,
    categoryList,
    groupList,
    showIdColumn,
}: {
    withActions?: boolean;
    exerciseList?: Exercise[];
    programList?: Program[];
    dailyList?: Daily[];
    tagList?: Tag[];
    categoryList?: Category[];
    groupList?: Group[];
    showIdColumn?: boolean;
}) => {
    return (
        <Accordion allowMultiple>
            {exerciseList && (
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
                            <DynamicTable
                                columns={exerciseColumns}
                                data={exerciseList}
                                isHeaderSticky
                                hiddenColumns={!showIdColumn ? ["id"] : []}
                            />
                        </Box>
                    </AccordionPanel>
                </AccordionItem>
            )}
            {programList && (
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
                                hiddenColumns={!showIdColumn ? ["id"] : []}
                                getRowProps={(row) => ({ ...(row as any).getToggleRowExpandedProps() })}
                                renderSubRow={({ row }) => (
                                    <HFlex pb="4">
                                        <Box>Exercise list:</Box>
                                        <ProgramCardExerciseList program={row.original as Program} />
                                    </HFlex>
                                )}
                            />
                        </Box>
                    </AccordionPanel>
                </AccordionItem>
            )}
            {dailyList && (
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
                                hiddenColumns={!showIdColumn ? ["id"] : []}
                                getRowProps={(row) => ({ ...(row as any).getToggleRowExpandedProps() })}
                                renderSubRow={({ row }) => (
                                    <HFlex pb="4">
                                        <Box>Exercise list:</Box>
                                        <ProgramCardExerciseList program={row.original as Program} />
                                    </HFlex>
                                )}
                            />
                        </Box>
                    </AccordionPanel>
                </AccordionItem>
            )}
            {tagList && (
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
                            <DynamicTable
                                columns={tagsColumns}
                                data={tagList}
                                isHeaderSticky
                                hiddenColumns={!showIdColumn ? ["id"] : []}
                            />
                        </Box>
                    </AccordionPanel>
                    {withActions && (
                        <Box px="4" py="2" w="100%">
                            <PersistModal
                                title="Add tag"
                                formId="AddTagForm"
                                renderTrigger={(onOpen) => (
                                    <Button onClick={onOpen} w="100%" colorScheme="pink" variant="outline">
                                        Add tag
                                    </Button>
                                )}
                                renderBody={(onClose) => <AddTagForm onSuccess={onClose} />}
                            />
                        </Box>
                    )}
                </AccordionItem>
            )}
            {categoryList && (
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
                            <DynamicTable
                                columns={categoryColumns}
                                data={categoryList}
                                isHeaderSticky
                                hiddenColumns={!showIdColumn ? ["id"] : []}
                            />
                        </Box>
                    </AccordionPanel>
                    {withActions && (
                        <Box px="4" py="2" w="100%">
                            <PersistModal
                                title="Add category"
                                formId="AddCategoryForm"
                                renderTrigger={(onOpen) => (
                                    <Button onClick={onOpen} w="100%" colorScheme="pink" variant="outline">
                                        Add category
                                    </Button>
                                )}
                                renderBody={(onClose) => <AddCategoryForm onSuccess={onClose} />}
                            />
                        </Box>
                    )}
                </AccordionItem>
            )}
            {groupList && (
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
                            <DynamicTable
                                columns={groupColumns}
                                data={groupList}
                                isHeaderSticky
                                hiddenColumns={!showIdColumn ? ["id"] : []}
                            />
                        </Box>
                    </AccordionPanel>
                    {withActions && (
                        <Box px="4" py="2" w="100%">
                            <PersistModal
                                title="Add group"
                                formId="AddGroupForm"
                                renderTrigger={(onOpen) => (
                                    <Button onClick={onOpen} w="100%" colorScheme="pink" variant="outline">
                                        Add group
                                    </Button>
                                )}
                                renderBody={(onClose) => <AddGroupForm onSuccess={onClose} />}
                            />
                        </Box>
                    )}
                </AccordionItem>
            )}
        </Accordion>
    );
};

type TagFormValues = Tag & {
    categoryList: Category[];
    addedCategoryList: Array<Category["id"]>;
    removedCategoryList: Array<Category["id"]>;
};
const defaultTagValues: TagFormValues = {
    id: "",
    name: "",
    groupId: "",
    color: "",
    categoryList: [],
    addedCategoryList: [],
    removedCategoryList: [],
};
const TagForm = ({
    defaultValues,
    onSubmit,
    formId,
}: {
    formId: string;
    defaultValues?: TagFormValues;
    onSubmit: (values: TagFormValues) => void;
}) => {
    const form = useForm({ defaultValues: (defaultValues as TagFormValues) || defaultTagValues });
    const groupList = useGroupList();

    const hasUpdatedIdManually = useRef(false);
    const [initialCategoryList] = useState(() => (defaultValues?.categoryList || []).map((c) => c.id));

    const categoryList = useCategoryList();
    const [addedCategoryList, removedCategoryList] = useWatch({
        control: form.control,
        name: ["addedCategoryList", "removedCategoryList"],
    });

    return (
        <Stack as="form" id={formId} onSubmit={form.handleSubmit(onSubmit)} spacing="2">
            <TextInput
                {...mergeProps(form.register("name", { required: requiredRule }), {
                    onChange: defaultValues?.id
                        ? undefined
                        : (e) => void (!hasUpdatedIdManually.current && form.setValue("id", slugify(e.target.value))),
                })}
                label="Name *"
                error={form.formState.errors.name}
            />
            <SelectInput
                {...form.register("groupId", { required: requiredRule })}
                label="Group *"
                error={form.formState.errors.groupId}
                defaultValue=""
            >
                <option value="" disabled hidden>
                    Pick one
                </option>
                {groupList.map((group) => (
                    <option key={group.id} value={group.id}>
                        {group.name}
                    </option>
                ))}
            </SelectInput>
            <Box mt="2">
                <MultiSelect
                    onChange={(items) => {
                        form.setValue("categoryList", items);
                        form.setValue(
                            "addedCategoryList",
                            getDiff(
                                items.map((c) => c.id),
                                initialCategoryList
                            )
                        );
                        form.setValue(
                            "removedCategoryList",
                            getDiff(
                                initialCategoryList,
                                items.map((c) => c.id)
                            )
                        );
                    }}
                    isOpen
                    defaultValue={defaultValues?.categoryList || []}
                    getValue={(item) => item.id}
                    itemToString={(item) => item.name}
                    items={categoryList}
                    label={(getLabelProps) => <FormLabel {...getLabelProps()}>Used in categories:</FormLabel>}
                    getButtonProps={() => ({ w: "100%" })}
                    renderAfterOptionText={(catId) => {
                        if (addedCategoryList.includes(catId)) {
                            return (
                                <ChakraTag size="sm" variant="subtle" colorScheme="whatsapp" transform="scale(0.85)">
                                    <Text>New !</Text>
                                </ChakraTag>
                            );
                        }
                        if (removedCategoryList.includes(catId)) {
                            return (
                                <ChakraTag size="sm" variant="subtle" colorScheme="red" transform="scale(0.85)">
                                    <Text>Removed</Text>
                                </ChakraTag>
                            );
                        }
                    }}
                    renderButtonText={(selection) => (
                        <Text maxW="100%" textOverflow="ellipsis" overflow="hidden">
                            {selection.length
                                ? `(${selection.length}) ${selection.map((item) => item.name).join(", ")}`
                                : "none"}
                        </Text>
                    )}
                />
            </Box>
            <TextInput
                {...form.register("id", { required: requiredRule })}
                isDisabled={Boolean(defaultValues?.id)}
                onChange={(e) => (hasUpdatedIdManually.current = true)}
                label="Id"
                error={form.formState.errors.id}
                placeholder="Auto-generated unless overriden"
                size="sm"
            />
        </Stack>
    );
};

const AddTagForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const queryClient = useQueryClient();
    const mutation = useMutation(
        (values: TagFormValues) => {
            const { categoryList, addedCategoryList, removedCategoryList, ...tag } = values;
            return Promise.all([
                orm.tag.add(tag),
                ...addedCategoryList.map((catId) => {
                    orm.category.upsert(catId, (current) => ({
                        ...current,
                        tagList: current.tagList.concat(tag.id),
                    }));
                }),
            ]);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(orm.tag.name);
                toasts.success("Tag added");
                onSuccess();
            },
        }
    );

    return <TagForm formId="AddTagForm" onSubmit={(values) => mutation.mutate(values)} />;
};

const defaultCategoryValues: Category = { id: "", name: "", tagList: [] };
const CategoryForm = ({
    defaultValues,
    onSubmit,
    formId,
}: {
    formId: string;
    defaultValues?: Category;
    onSubmit: (values: typeof defaultCategoryValues) => void;
}) => {
    const form = useForm({ defaultValues: defaultValues || defaultCategoryValues });
    const tagList = useTagList();

    const hasUpdatedIdManually = useRef(false);

    return (
        <Stack as="form" id={formId} onSubmit={form.handleSubmit(onSubmit)} spacing="2">
            <TextInput
                {...mergeProps(form.register("name", { required: requiredRule }), {
                    onChange: defaultValues?.id
                        ? undefined
                        : (e) => void (!hasUpdatedIdManually.current && form.setValue("id", slugify(e.target.value))),
                })}
                label="Name *"
                error={form.formState.errors.name}
            />
            <TagMultiSelect
                control={form.control}
                name="tagList"
                rules={{ required: requiredRule }}
                items={tagList}
                error={(form.formState.errors.tagList as any)?.message}
                defaultValue={form.getValues()?.tagList || []}
            />
            <TextInput
                {...form.register("id", { required: requiredRule })}
                isDisabled={Boolean(defaultValues?.id)}
                onChange={(e) => (hasUpdatedIdManually.current = true)}
                label="Id"
                error={form.formState.errors.id}
                placeholder="Auto-generated unless overriden"
                size="sm"
            />
        </Stack>
    );
};

const AddCategoryForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const queryClient = useQueryClient();
    const mutation = useMutation(
        (values: typeof defaultCategoryValues) => {
            return orm.category.add({ ...values, tagList: values.tagList.map((tag) => tag.id) });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(orm.category.name);
                toasts.success("Category added");
                onSuccess();
            },
        }
    );

    return <CategoryForm formId="AddCategoryForm" onSubmit={(values) => mutation.mutate(values)} />;
};

const defaultGroupValues: Group = { id: "", name: "" };
const GroupForm = ({
    defaultValues,
    onSubmit,
    formId,
}: {
    formId: string;
    defaultValues?: Group;
    onSubmit: (values: typeof defaultGroupValues) => void;
}) => {
    const form = useForm({ defaultValues: defaultValues || defaultGroupValues });

    const hasUpdatedIdManually = useRef(false);

    return (
        <Stack as="form" id={formId} onSubmit={form.handleSubmit(onSubmit)} spacing="2">
            <TextInput
                {...mergeProps(form.register("name", { required: requiredRule }), {
                    onChange: defaultValues?.id
                        ? undefined
                        : (e) => void (!hasUpdatedIdManually.current && form.setValue("id", slugify(e.target.value))),
                })}
                label="Name *"
                error={form.formState.errors.name}
            />
            <TextInput
                {...form.register("id", { required: requiredRule })}
                isDisabled={Boolean(defaultValues?.id)}
                onChange={(e) => (hasUpdatedIdManually.current = true)}
                label="Id"
                error={form.formState.errors.id}
                placeholder="Auto-generated unless overriden"
                size="sm"
            />
        </Stack>
    );
};

const AddGroupForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const queryClient = useQueryClient();
    const mutation = useMutation(
        (values: typeof defaultGroupValues) => {
            return orm.group.add(values);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(orm.group.name);
                toasts.success("Group added");
                onSuccess();
            },
        }
    );

    return <GroupForm formId="AddGroupForm" onSubmit={(values) => mutation.mutate(values)} />;
};

const tagsColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
    { Header: "group", accessor: "groupId" },
    {
        Header: "",
        accessor: "__actions",
        Cell: ({ row }) => {
            const tag = row.original as Tag;
            const categoryList = useCategoryList().filter((category) =>
                category.tagList.map((tag) => tag.id).includes(tag.id)
            );

            const queryClient = useQueryClient();
            const deleteMutation = useMutation(async () => orm.tag.delete(tag.id), {
                onSuccess: () => {
                    queryClient.invalidateQueries(orm.tag.name);
                    toasts.success(`Tag <${tag.name}> deleted !`);
                },
                onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
            });

            const editMutation = useMutation(
                async (values: TagFormValues) => {
                    const { categoryList, addedCategoryList, removedCategoryList, ...tag } = values;
                    return Promise.all([
                        orm.tag.put(tag),
                        ...addedCategoryList.map((catId) => {
                            orm.category.upsert(catId, (current) => ({
                                ...current,
                                tagList: current.tagList.concat(tag.id),
                            }));
                        }),
                        ...removedCategoryList.map((catId) => {
                            orm.category.upsert(catId, (current) => ({
                                ...current,
                                tagList: current.tagList.filter((tagId) => tagId !== tag.id),
                            }));
                        }),
                    ]);
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries([orm.tag.name]);
                        toasts.success(`Tag <${tag.name}> updated !`);
                    },
                    onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
                }
            );

            return (
                <Menu strategy="absolute">
                    <MenuButton as={DotsIconButton} />
                    <MenuList>
                        <PersistModal
                            title="Edit tag"
                            formId="EditTagForm"
                            renderTrigger={(onOpen) => (
                                <MenuItem icon={<EditIcon />} onClick={onOpen}>
                                    Edit
                                </MenuItem>
                            )}
                            renderBody={(onClose) => (
                                <TagForm
                                    formId="EditTagForm"
                                    defaultValues={{
                                        ...tag,
                                        categoryList,
                                        addedCategoryList: [],
                                        removedCategoryList: [],
                                    }}
                                    onSubmit={(values) => editMutation.mutate(values, { onSuccess: onClose })}
                                />
                            )}
                        />
                        {/* TODO handle cascade delete */}
                        {false && (
                            <ConfirmationButton
                                renderTrigger={(onOpen) => (
                                    <MenuItem icon={<DeleteIcon />} onClick={onOpen}>
                                        Delete
                                    </MenuItem>
                                )}
                                onConfirm={() => deleteMutation.mutate()}
                            />
                        )}
                    </MenuList>
                </Menu>
            );
        },
    },
];

const categoryColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
    {
        Header: "tagList",
        accessor: "tagList",
        Cell: (props) => (props.value as Tag[]).map((t) => t.name).join(", "),
    },
    {
        Header: "",
        accessor: "__actions",
        Cell: ({ row }) => {
            const category = row.original as Category;

            const queryClient = useQueryClient();
            const deleteMutation = useMutation(async () => orm.category.delete(category.id), {
                onSuccess: () => {
                    queryClient.invalidateQueries(orm.category.name);
                    toasts.success(`Category <${category.name}> deleted !`);
                },
                onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
            });

            const editMutation = useMutation(
                async (values: Category) => orm.category.put({ ...values, tagList: values.tagList.map((t) => t.id) }),
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries([orm.category.name]);
                        toasts.success(`Category <${category.name}> updated !`);
                    },
                    onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
                }
            );

            return (
                <Menu strategy="absolute">
                    <MenuButton as={DotsIconButton} />
                    <MenuList>
                        <PersistModal
                            title="Edit category"
                            formId="EditCategoryForm"
                            renderTrigger={(onOpen) => (
                                <MenuItem icon={<EditIcon />} onClick={onOpen}>
                                    Edit
                                </MenuItem>
                            )}
                            renderBody={(onClose) => (
                                <CategoryForm
                                    formId="EditCategoryForm"
                                    defaultValues={category}
                                    onSubmit={(values) => editMutation.mutate(values, { onSuccess: onClose })}
                                />
                            )}
                        />
                        {/* TODO handle cascade delete */}
                        {false && (
                            <ConfirmationButton
                                renderTrigger={(onOpen) => (
                                    <MenuItem icon={<DeleteIcon />} onClick={onOpen}>
                                        Delete
                                    </MenuItem>
                                )}
                                onConfirm={() => deleteMutation.mutate()}
                            />
                        )}
                    </MenuList>
                </Menu>
            );
        },
    },
];

const groupColumns = [
    { Header: "id", accessor: "id" },
    { Header: "name", accessor: "name" },
    {
        Header: "",
        accessor: "__actions",
        Cell: ({ row }) => {
            const group = row.original as Group;

            const queryClient = useQueryClient();
            const deleteMutation = useMutation(async () => orm.group.delete(group.id), {
                onSuccess: () => {
                    queryClient.invalidateQueries(orm.group.name);
                    toasts.success(`Group <${group.name}> deleted !`);
                },
                onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
            });

            const editMutation = useMutation(async (values: Group) => orm.group.put(values), {
                onSuccess: () => {
                    queryClient.invalidateQueries([orm.group.name]);
                    toasts.success(`Group <${group.name}> updated !`);
                },
                onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
            });

            return (
                <Menu strategy="absolute">
                    <MenuButton as={DotsIconButton} />
                    <MenuList>
                        <PersistModal
                            title="Edit group"
                            formId="EditGroupForm"
                            renderTrigger={(onOpen) => (
                                <MenuItem icon={<EditIcon />} onClick={onOpen}>
                                    Edit
                                </MenuItem>
                            )}
                            renderBody={(onClose) => (
                                <GroupForm
                                    formId="EditGroupForm"
                                    defaultValues={group}
                                    onSubmit={(values) => editMutation.mutate(values, { onSuccess: onClose })}
                                />
                            )}
                        />
                        {/* TODO handle cascade delete */}
                        {false && (
                            <ConfirmationButton
                                renderTrigger={(onOpen) => (
                                    <MenuItem icon={<DeleteIcon />} onClick={onOpen}>
                                        Delete
                                    </MenuItem>
                                )}
                                onConfirm={() => deleteMutation.mutate()}
                            />
                        )}
                    </MenuList>
                </Menu>
            );
        },
    },
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
