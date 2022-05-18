import { HFlex } from "@/components/HFlex";
import { ExerciseTag, ExerciseTagList } from "@/Exercises/ExerciseTag";
import { Exercise } from "@/orm-types";
import { DragHandleIcon } from "@chakra-ui/icons";
import { Box, Divider, Flex, Heading, Icon, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { Fragment, ReactNode } from "react";
import { ExerciseSetListOverview } from "./ExerciseSetList";

export const FlexExerciseList = ({ exerciseList }: { exerciseList: Exercise[] }) => {
    return <ExerciseList exerciseList={exerciseList} render={FlexExercise} />;
};

const FlexExercise = ({ exercise }: { exercise: Exercise }) => <ExerciseListItem exo={exercise} />;

export const ExerciseList = ({
    exerciseList,
    render,
}: {
    exerciseList: Exercise[];
    render: ({ exercise, index }: { exercise: Exercise; index: number }) => ReactNode;
}) => (
    <>
        {exerciseList.map((exercise, index) => {
            return (
                // <Fragment key={index}>
                //     {index > 0 && (
                //         <Box px="4">
                //             <Divider my="2" />
                //         </Box>
                //     )}
                //     {render({ exercise, index })}
                // </Fragment>
                render({ exercise, index })
            );
        })}
    </>
);

export function ExerciseListItem({ exo }: { exo: Exercise }) {
    return (
        <>
            <Flex flexDirection="column" w="100%">
                <Flex w="100%" alignItems="flex-end">
                    <Heading as="h4" size="md">
                        {exo.name}
                    </Heading>
                </Flex>
                <ExerciseSetListOverview setList={exo.series} />
                <ExerciseTagList mt="2" tagList={exo.tags} />
            </Flex>
            <HFlex justifyContent="space-around" p="4" ml="auto">
                <Icon as={DragHandleIcon} size="24px" />
            </HFlex>
        </>
    );
}