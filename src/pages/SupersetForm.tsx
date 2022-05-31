import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { useCurrentDailyQuery } from "@/orm-hooks";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Heading, Stack } from "@chakra-ui/react";
import { makeArrayOf } from "@pastable/core";
import { useSelector } from "@xstate/react";
import { Fragment } from "react";
import { match } from "ts-pattern";
import { useExerciseFormMachine } from "./ExerciseFormMachine";
import { getRouteTypeFromPathname } from "./ExercisePageLayout";

export function SupersetForm({ onSubmit }: { onSubmit: () => void | Promise<void> }) {
    const query = useCurrentDailyQuery();
    const daily = query.data;
    const exoNameList = daily.exerciseList.map((exo) => exo.name);

    const service = useExerciseFormMachine();
    const exoCount = useSelector(service, (state) => state.context.exerciseCount);
    const canSubmit = useSelector(service, (state) => state.matches("superset.canSubmit"));

    const route = getRouteTypeFromPathname(location.pathname);
    const title = match(route)
        .with("add", () => "Create superset")
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
                        category={daily.category}
                        defaultValues={service.state.context.supersetForms[i]}
                        onChange={(values) => service.send({ type: "UpdateSupersetForm", index: i, form: values })}
                        shouldOverflow={false}
                        getExerciseItems={(items) => items.filter((item) => !exoNameList.includes(item.name))}
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
