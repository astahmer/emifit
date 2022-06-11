import { ConfirmationButton } from "@/components/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { DynamicTable } from "@/components/DynamicTable";
import { HFlex } from "@/components/HFlex";
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
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "react-query";
import { PersistModal } from "../components/PersistModal";
import { AddCategoryForm, CategoryForm } from "./CategoryForm";
import { AddGroupForm, GroupForm } from "./GroupForm";
import { AddTagForm, TagFormValues, TagForm } from "./TagForm";

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
