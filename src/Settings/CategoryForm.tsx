import { TextInput } from "@/components/TextInput";
import { TagMultiSelect } from "@/Exercises/TagMultiSelect";
import { mergeProps } from "@/functions/mergeProps";
import { toasts } from "@/functions/toasts";
import { requiredRule, slugify } from "@/functions/utils";
import { orm } from "@/orm";
import { useTagList } from "@/orm-hooks";
import { Category } from "@/orm-types";
import { Stack } from "@chakra-ui/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

const defaultCategoryValues: Category = { id: "", name: "", tagList: [] };

export const CategoryForm = ({
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

export const AddCategoryForm = ({ onSuccess }: { onSuccess: () => void }) => {
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
