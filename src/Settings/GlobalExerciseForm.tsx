import { Show } from "@/components/Show";
import { TextInput } from "@/fields/TextInput";
import { requiredRule } from "@/functions/utils";
import { useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

export type GlobalExerciseFormValues = Pick<Exercise, "name">;

const defaultExerciseValues: GlobalExerciseFormValues = { name: "" };

export const GlobalExerciseForm = ({
    defaultValues: defaultValuesProp,
    onSubmit,
    formId,
    canShowStats,
}: {
    formId: string;
    defaultValues?: GlobalExerciseFormValues;
    onSubmit: (values: GlobalExerciseFormValues) => void;
    canShowStats?: boolean;
}) => {
    const defaultValues = defaultValuesProp || defaultExerciseValues;
    const form = useForm({ defaultValues });

    const query = useExerciseUnsortedList({ index: "by-name", query: defaultValues.name });
    const exerciseList = query.data || [];
    const exerciseListInProgram = exerciseList.filter((exo) => Boolean(exo.programId));

    return (
        <Stack as="form" id={formId} onSubmit={form.handleSubmit(onSubmit)} spacing="2">
            <TextInput
                {...form.register("name", { required: requiredRule })}
                label="Name *"
                error={form.formState.errors.name}
            />
            <Show when={canShowStats}>
                <Flex alignItems="center">
                    <Text fontSize="2xl" fontWeight="bold">
                        {exerciseList.length}
                    </Text>
                    <Text ml="1">total occurences :</Text>
                </Flex>
                <div>
                    <Box ml="4" opacity="0.8">
                        <Flex alignItems="center">
                            <Text fontSize="lg" mr="3">
                                -
                            </Text>
                            <Text fontSize="lg" fontWeight="bold">
                                {exerciseList.length - exerciseListInProgram.length}
                            </Text>
                            <Text fontSize="xs" ml="2">
                                from daily entries
                            </Text>
                        </Flex>
                        <Flex alignItems="center">
                            <Text fontSize="lg" mr="3">
                                -
                            </Text>
                            <Text fontSize="lg" fontWeight="bold">
                                {exerciseListInProgram.length}
                            </Text>
                            <Text fontSize="xs" ml="2">
                                from programs
                            </Text>
                        </Flex>
                    </Box>
                </div>
            </Show>
        </Stack>
    );
};
