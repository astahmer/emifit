import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { useCurrentDailyQuery } from "@/orm-hooks";
import { getRouteTypeFromPathname } from "@/Daily/DailyExercisePageLayout";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Heading, Stack } from "@chakra-ui/react";
import { makeArrayOf } from "pastable";
import { useSelector } from "@xstate/react";
import { ComponentProps, Fragment } from "react";
import { match } from "ts-pattern";
import { useExerciseFormMachine } from "./ExerciseFormMachine";

export function SupersetForm({
    onSubmit,
    ...props
}: { onSubmit: () => void | Promise<void> } & Partial<ComponentProps<typeof CreateExerciseForm>> &
    Pick<ComponentProps<typeof CreateExerciseForm>, "category">) {
    const service = useExerciseFormMachine();
    const exoCount = useSelector(service, (state) => state.context.exerciseCount);
    const canSubmit = useSelector(service, (state) => state.matches("superset.canSubmit"));

    const route = getRouteTypeFromPathname(location.pathname);
    const title = match(route)
        .with("add", "copy", () => "Create superset")
        .with("edit-superset", () => "Update superset")
        .run();

    return (
        <Stack h="100%" overflow="auto" minH={0}>
            {makeArrayOf(exoCount).map((_, i) => (
                <Fragment key={i}>
                    {i > 0 && (
                        <Box px="8">
                            <Divider my="2" />
                        </Box>
                    )}
                    <Box px="6">
                        <Heading as="h3" size="md" color="pink.300" mb="-4">
                            Exercise {i + 1}
                        </Heading>
                    </Box>
                    <CreateExerciseForm
                        {...props}
                        defaultValues={service.state.context.supersetForms[i]}
                        onChange={(values) => service.send({ type: "UpdateSupersetForm", index: i, form: values })}
                        shouldOverflow={false}
                    />
                </Fragment>
            ))}
            {canSubmit && (
                <Box p="4" pb="0">
                    <Divider />
                    <Box py="4">
                        <Button
                            mt="4"
                            isFullWidth
                            leftIcon={<CheckIcon />}
                            colorScheme="pink"
                            variant="solid"
                            size="lg"
                            onClick={() => onSubmit()}
                        >
                            {title}
                        </Button>
                    </Box>
                </Box>
            )}
        </Stack>
    );
}

export function DailySupersetForm({ onSubmit }: { onSubmit: () => void | Promise<void> }) {
    const query = useCurrentDailyQuery();
    const daily = query.data;
    const exoNameList = daily.exerciseList.map((exo) => exo.name);

    return (
        <SupersetForm
            category={daily.category}
            getExerciseItems={(items) => items.filter((item) => !exoNameList.includes(item.name))}
            onSubmit={onSubmit}
        />
    );
}
