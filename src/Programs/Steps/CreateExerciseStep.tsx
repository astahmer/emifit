import { CheckboxButton } from "@/fields/CheckboxCircle";
import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { Exercise } from "@/orm-types";
import { CheckIcon } from "@chakra-ui/icons";
import { Button, Divider, Heading } from "@chakra-ui/react";

export function CreateExerciseStep({
    hasSelectedExercises,
    category,
    onSubmit,
}: {
    hasSelectedExercises: boolean;
    category: string;
    onSubmit: (data: Exercise) => void;
}) {
    return (
        <>
            <Heading
                as="h3"
                size="md"
                textAlign="center"
                textDecoration={hasSelectedExercises ? "line-through" : undefined}
                opacity={hasSelectedExercises ? "0.5" : undefined}
                color="pink.500"
                mb="3"
            >
                <CheckboxButton isActive={hasSelectedExercises} aria-label="Step 1 done" />
                Create an exercise :
            </Heading>
            <CreateExerciseForm
                category={category}
                onSubmit={onSubmit}
                renderSubmit={(form) => {
                    const [name, tags] = form.watch(["name", "tags"]);

                    return (
                        Boolean(name && tags.length) && (
                            <>
                                <Divider />
                                <Button
                                    mt="4"
                                    w="100%"
                                    leftIcon={<CheckIcon />}
                                    colorScheme="pink"
                                    variant="solid"
                                    type="submit"
                                    size="lg"
                                >
                                    Create
                                </Button>
                            </>
                        )
                    );
                }}
            />
        </>
    );
}
