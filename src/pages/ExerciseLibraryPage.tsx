import { VFlex } from "@/components/VFlex";
import { Heading } from "@chakra-ui/react";
import { ExerciseLibrary } from "../Exercises/ExerciseLibrary";

export const ExerciseLibraryPage = () => {
    return (
        <VFlex id="ExerciseLibraryPage" h="100%" p="4" w="100%" pos="relative">
            <Heading as="h1">Exercise Library</Heading>
            <ExerciseLibrary />
        </VFlex>
    );
};
