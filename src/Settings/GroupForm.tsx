import { TextInput } from "@/components/TextInput";
import { mergeProps } from "@/functions/mergeProps";
import { toasts } from "@/functions/toasts";
import { requiredRule, slugify } from "@/functions/utils";
import { orm } from "@/orm";
import { Group } from "@/orm-types";
import { Stack } from "@chakra-ui/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

const defaultGroupValues: Group = { id: "", name: "" };

export const GroupForm = ({
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

export const AddGroupForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const queryClient = useQueryClient();
    const mutation = useMutation(
        (values: typeof defaultGroupValues) => {
            return orm.group.add(values);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries([orm.group.name]);
                toasts.success("Group added");
                onSuccess();
            },
        }
    );

    return <GroupForm formId="AddGroupForm" onSubmit={(values) => mutation.mutate(values)} />;
};
