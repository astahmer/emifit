import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { Categories } from "@/constants";
import { Box, Button, Divider, Heading } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckIcon } from "@chakra-ui/icons";

export const AddPage = () => {
    const [params] = useSearchParams();
    const catId = params.get("category") || Categories[0].id;

    const navigate = useNavigate();
    return (
        <Box id="CreateExercisePage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">Create exercise</Heading>
            <Box mt="auto">
                <CreateExerciseForm
                    catId={catId}
                    onCreated={() => navigate("/")}
                    renderSubmit={(form) => {
                        const [name, tags] = form.watch(["name", "tags"]);

                        return (
                            Boolean(name && tags.length) && (
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
                                            Create
                                        </Button>
                                    </Box>
                                </Box>
                            )
                        );
                    }}
                />
            </Box>
        </Box>
    );
};
