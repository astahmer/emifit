import { Box, Heading } from "@chakra-ui/react";
import { ExerciseLibrary } from "../Exercises/ExerciseLibrary";

export const ExerciseLibraryPage = () => {
    return (
        <Box id="ExerciseLibraryPage" d="flex" flexDirection="column" h="100%" p="4" w="100%" pos="relative">
            <Heading as="h1">Exercise Library</Heading>
            <ExerciseLibrary />
        </Box>
    );
};
