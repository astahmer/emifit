import { ExerciseSetList, ExerciseSetListOverview } from "@/Exercises/ExerciseSetList";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { Exercise } from "@/orm-types";
import { Flex, Heading, Spacer } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ExerciseNote } from "./ExerciseNote";

export const ExerciseTaskItem = ({
    exo,
    renderLeft,
    renderAfterName,
}: {
    exo: Exercise;
    renderLeft?: () => ReactNode;
    renderAfterName?: () => ReactNode;
}) => {
    return (
        <Flex>
            {renderLeft?.() || <Spacer pl="8" />}
            <Flex flexDirection="column" pr="8" w="100%">
                <Flex w="100%" alignItems="flex-end">
                    <Heading as="h4" size="md">
                        {exo.name}
                    </Heading>
                    {renderAfterName?.()}
                </Flex>
                <ExerciseSetListOverview setList={exo.series} />
                <ExerciseTagList mt="2" tagList={exo.tags} />
                <ExerciseSetList mt="2" fontSize="sm" setList={exo.series} />
                <ExerciseNote exo={exo} />
            </Flex>
        </Flex>
    );
};
