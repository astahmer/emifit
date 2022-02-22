import { CreateExerciseForm } from "@/Exercises/CreateExerciseForm";
import { Categories } from "@/constants";
import { Box } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const AddPage = () => {
    const [params] = useSearchParams();
    const catId = params.get("category") || Categories[0].id;

    const navigate = useNavigate();
    return (
        <Box mt="auto" overflow="auto">
            <CreateExerciseForm catId={catId} onCreated={() => navigate("/")} />
        </Box>
    );
};
