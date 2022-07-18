import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { useCurrentDailyQuery } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Divider } from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { match } from "ts-pattern";
import { useExerciseFormMachine } from "./ExerciseFormMachine";
import { getRouteTypeFromPathname } from "../Daily/DailyExercisePageLayout";
import { ComponentProps } from "react";

export function SingleExerciseForm({
    onSubmit,
    ...props
}: { onSubmit: (exo: Exercise) => void | Promise<void> } & Partial<ComponentProps<typeof CreateExerciseForm>> &
    Pick<ComponentProps<typeof CreateExerciseForm>, "category">) {
    const service = useExerciseFormMachine();
    const isInitialized = useSelector(service, () => service.initialized);

    const route = getRouteTypeFromPathname(location.pathname);
    const title = match(route)
        .with("add", "copy", () => "Create")
        .with("edit", () => "Update")
        .run();

    return (
        <CreateExerciseForm
            id="single-form"
            {...props}
            defaultValues={isInitialized ? service.state.context.singleForm : undefined}
            onSubmit={onSubmit}
            onChange={(values) => service.send({ type: "UpdateForm", form: values })}
            renderSubmit={() => {
                const canSubmit = useSelector(service, (state) => state.matches("single.canSubmit"));

                return (
                    canSubmit && (
                        <Box p="4" pb="0">
                            <Divider />
                            <Box py="4">
                                <Button
                                    mt="4"
                                    isFullWidth
                                    leftIcon={<CheckIcon />}
                                    colorScheme="pink"
                                    variant="solid"
                                    type="submit"
                                    size="lg"
                                >
                                    {title}
                                </Button>
                            </Box>
                        </Box>
                    )
                );
            }}
        />
    );
}

export function DailySingleExerciseForm({ onSubmit }: Omit<ComponentProps<typeof SingleExerciseForm>, "category">) {
    const query = useCurrentDailyQuery();
    const daily = query.data;
    const exoNameList = daily.exerciseList.map((exo) => exo.name);

    return (
        <SingleExerciseForm
            category={daily.category}
            getExerciseItems={(items) => items.filter((item) => !exoNameList.includes(item.name))}
            onSubmit={onSubmit}
        />
    );
}
