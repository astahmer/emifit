import { MultiSelect } from "@/components/MultiSelect";
import { SelectInput } from "@/components/SelectInput";
import { TextInput } from "@/components/TextInput";
import { mergeProps } from "@/functions/mergeProps";
import { toasts } from "@/functions/toasts";
import { requiredRule, slugify } from "@/functions/utils";
import { orm } from "@/orm";
import { useCategoryList, useGroupList } from "@/orm-hooks";
import { Category, Tag } from "@/orm-types";
import { Box, FormLabel, Stack, Tag as ChakraTag, Text } from "@chakra-ui/react";
import { getDiff } from "@pastable/core";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

export type TagFormValues = Tag & {
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

export const TagForm = ({
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

export const AddTagForm = ({ onSuccess }: { onSuccess: () => void }) => {
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
                queryClient.invalidateQueries([orm.tag.name]);
                toasts.success("Tag added");
                onSuccess();
            },
        }
    );

    return <TagForm formId="AddTagForm" onSubmit={(values) => mutation.mutate(values)} />;
};
