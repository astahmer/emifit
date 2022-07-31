import { FooterSpacer, ViewLayout } from "@/Layout";
import { Heading } from "@chakra-ui/react";
import { ExerciseLibrary } from "../Exercises/ExerciseLibrary";

export const ExerciseLibraryPage = () => {
    return (
        <ViewLayout>
            <ViewLayout id="ExerciseLibraryPage" p="4">
                <Heading as="h1">Exercise Library</Heading>
                <ExerciseLibrary />
            </ViewLayout>
            <FooterSpacer />
        </ViewLayout>
    );
};
