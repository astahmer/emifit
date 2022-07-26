import { ConfirmationButton } from "@/fields/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { DynamicTable } from "@/components/DynamicTable";
import { VFlex } from "@/components/VFlex";
import { onError, toasts } from "@/functions/toasts";
import { orm, StoreQueryParams } from "@/orm";
import { useCategoryList } from "@/orm-hooks";
import { Category, Daily, Exercise, Group, Program, Tag } from "@/orm-types";
import { ProgramCardExerciseList } from "@/Programs/ProgramCard";
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PersistModal } from "../fields/PersistModal";
import { AddCategoryForm, CategoryForm } from "./CategoryForm";
import { GlobalExerciseForm, GlobalExerciseFormValues } from "./GlobalExerciseForm";
import { AddGroupForm, GroupForm } from "./GroupForm";
import { AddTagForm, TagForm, TagFormValues } from "./TagForm";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

export const DataAccordions = ({
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
                                hiddenColumns={(!showIdColumn ? ["id"] : []).concat(withActions ? [] : ["__actions"])}
                                initialSortBy={[{ id: "name", desc: false }]}
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
                                hiddenColumns={(!showIdColumn ? ["id"] : []).concat(withActions ? [] : ["__actions"])}
                                getRowProps={(row) => ({ onClick: row.getToggleExpandedHandler() })}
                                renderSubRow={({ row }) => (
                                    <VFlex pb="4">
                                        <Box>Exercise list:</Box>
                                        <ProgramCardExerciseList exerciseList={row.original.exerciseList} />
                                    </VFlex>
                                )}
                                initialSortBy={[{ id: "name", desc: false }]}
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
                                hiddenColumns={(!showIdColumn ? ["id"] : []).concat(withActions ? [] : ["__actions"])}
                                getRowProps={(row) => ({ onClick: row.getToggleExpandedHandler() })}
                                renderSubRow={({ row }) => (
                                    <VFlex pb="4">
                                        <Box>Exercise list:</Box>
                                        <ProgramCardExerciseList exerciseList={row.original.exerciseList} />
                                    </VFlex>
                                )}
                                initialSortBy={[{ id: "id", desc: true }]}
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
                                hiddenColumns={(!showIdColumn ? ["id"] : []).concat(withActions ? [] : ["__actions"])}
                                initialSortBy={[{ id: "name", desc: false }]}
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
                                columns={categoryColumns as any}
                                data={categoryList}
                                isHeaderSticky
                                hiddenColumns={(!showIdColumn ? ["id"] : []).concat(withActions ? [] : ["__actions"])}
                                initialSortBy={[{ id: "name", desc: false }]}
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
                                hiddenColumns={(!showIdColumn ? ["id"] : []).concat(withActions ? [] : ["__actions"])}
                                initialSortBy={[{ id: "name", desc: false }]}
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

const makeTagColumn = createColumnHelper<Tag>();
const tagsColumns = [
    makeTagColumn.accessor("id", { header: "id" }),
    makeTagColumn.accessor("name", { header: "name" }),
    makeTagColumn.accessor("groupId", { header: "group" }),
    {
        header: "",
        accessorKey: "__actions",
        enableSorting: false,
        cell: ({ row }) => {
            const tag = row.original as Tag;
            const categoryList = useCategoryList().filter((category) =>
                category.tagList.map((tag) => tag.id).includes(tag.id)
            );

            const queryClient = useQueryClient();
            const deleteMutation = useMutation(async () => orm.tag.delete(tag.id), {
                onSuccess: () => {
                    queryClient.invalidateQueries([orm.tag.name]);
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
    } as ColumnDef<Tag>,
];
const categoryColumns = [
    { header: "id", accessorKey: "id" },
    {
        header: "name",
        accessorKey: "name",
        cell: (props) => (
            <Flex alignItems="center">
                <Box
                    mr="2"
                    borderRadius="md"
                    h="10px"
                    w="10px"
                    p={0}
                    minW="10px"
                    bg={props.row.original.color || "pink.300"}
                />
                <Text>{props.getValue()}</Text>
            </Flex>
        ),
    },
    {
        header: "tagList",
        accessorKey: "tagList",
        cell: (props) => (props.getValue() as Tag[]).map((t) => t.name).join(", "),
        enableSorting: false,
    },
    {
        header: "",
        accessorKey: "__actions",
        enableSorting: false,
        cell: ({ row }) => {
            const category = row.original as Category;

            const queryClient = useQueryClient();
            const deleteMutation = useMutation(async () => orm.category.delete(category.id), {
                onSuccess: () => {
                    queryClient.invalidateQueries([orm.category.name]);
                    toasts.success(`Category <${category.name}> deleted !`);
                },
                onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
            });

            const editMutation = useMutation(
                async (values: Category) => orm.category.put({ ...values, tagList: values.tagList.map((t) => t.id) }),
                {
                    onSuccess: async () => {
                        await queryClient.invalidateQueries([orm.category.name]);
                        await queryClient.invalidateQueries({
                            predicate: (query) => {
                                const params = query.queryKey[1] as StoreQueryParams<"exercise">;
                                return (
                                    query.queryKey[0] === orm.exercise.name &&
                                    params?.index === "by-category" &&
                                    params?.query === category.id
                                );
                            },
                        });
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

const columnHelper = createColumnHelper<Group>();
const groupColumns = [
    columnHelper.accessor("id", { header: "id" }),
    columnHelper.accessor("name", { header: "name" }),
    {
        header: "",
        accessorKey: "__actions",
        enableSorting: false,
        cell: ({ row }) => {
            const group = row.original as Group;

            const queryClient = useQueryClient();
            const deleteMutation = useMutation(async () => orm.group.delete(group.id), {
                onSuccess: () => {
                    queryClient.invalidateQueries([orm.group.name]);
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
    } as ColumnDef<Group>,
];
const makeExerciseColumn = createColumnHelper<Exercise>();
const exerciseColumns = [
    makeExerciseColumn.accessor("id", { header: "id" }),
    makeExerciseColumn.accessor("name", { header: "name" }),
    {
        header: "",
        accessorKey: "__actions",
        enableSorting: false,
        cell: ({ row }) => {
            const exercise = row.original as Exercise;
            const queryClient = useQueryClient();

            const editMutation = useMutation(
                async (values: GlobalExerciseFormValues) => {
                    const tx = orm.db.transaction("exercise", "readwrite");

                    let cursor = await tx.store.index("by-name").openCursor(exercise.name);

                    while (cursor) {
                        cursor.update({ ...cursor.value, name: values.name });
                        cursor = await cursor.continue();
                    }
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries([orm.exercise.name]);
                        toasts.success(`All occurrences of the exercise <${exercise.name}> have been updated !`);
                    },
                    onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
                }
            );

            return (
                <Menu strategy="absolute">
                    <MenuButton as={DotsIconButton} />
                    <MenuList>
                        <PersistModal
                            title="Edit exercise"
                            formId="EditExerciseForm"
                            renderTrigger={(onOpen) => (
                                <MenuItem icon={<EditIcon />} onClick={onOpen}>
                                    Edit
                                </MenuItem>
                            )}
                            renderBody={(onClose) => (
                                <GlobalExerciseForm
                                    formId="EditExerciseForm"
                                    defaultValues={{ name: exercise.name }}
                                    onSubmit={(values) => editMutation.mutate(values, { onSuccess: onClose })}
                                    canShowStats={editMutation.status === "idle" || editMutation.status === "success"}
                                />
                            )}
                        />
                    </MenuList>
                </Menu>
            );
        },
    } as ColumnDef<Exercise>,
];
const programColumns = [
    { header: "id", accessorKey: "id" },
    { header: "name", accessorKey: "name" },
    { header: "category", accessorKey: "category" },
    { header: "exo", accessorKey: "exerciseList", cell: (props) => props.getValue<Array<Exercise>>().length },
    {
        header: "",
        accessorKey: "__openRow",
        cell: ({ row }) => (row.getIsExpanded() ? <ChevronUpIcon /> : <ChevronDownIcon />),
    },
] as Array<ColumnDef<Program>>;

const dailyColumns = [
    { header: "id", accessorKey: "id" },
    { header: "category", accessorKey: "category" },
    { header: "exo", accessorKey: "exerciseList", cell: (props) => props.getValue<Array<Exercise>>().length },
    { header: "program", accessorKey: "programId" },
    {
        header: "",
        accessorKey: "__openRow",
        cell: ({ row }) => (row.getIsExpanded() ? <ChevronUpIcon /> : <ChevronDownIcon />),
    },
] as Array<ColumnDef<Daily>>;
