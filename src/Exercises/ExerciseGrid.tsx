import { Scrollable } from "@/components/Scrollable";
import { useCompactState } from "@/Daily/ExpandButton";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { Exercise, WithExerciseList } from "@/orm-types";
import { useCompactContext } from "@/store";
import { Box, Divider, Flex, Grid, Heading, Stack } from "@chakra-ui/react";
import { chunk, WithChildren } from "pastable";
import { Fragment } from "react";
import { ExerciseNote } from "./ExerciseNote";
import { ExerciseSetList, ExerciseSetListOverview } from "./ExerciseSetList";

export const ExerciseGridView = ({ exerciseList, children }: WithExerciseList & Partial<WithChildren>) => {
    return (
        <Scrollable pt="2" pb="8">
            {children}
            <ExerciseGrid exerciseList={exerciseList} />
        </Scrollable>
    );
};

export function ExerciseGrid({ exerciseList }: { exerciseList: Exercise[] }) {
    const [isCompact] = useCompactContext();

    return (
        <Stack p="4">
            {chunk(exerciseList, 2).map((chunk, index) => {
                return (
                    <Fragment key={index}>
                        {index > 0 && (
                            <Box px="8">
                                <Divider my={isCompact ? "1" : "2"} />
                            </Box>
                        )}
                        <Grid gridTemplateColumns="4fr 1fr 4fr">
                            {chunk.map((exo, exoIndex) => (
                                <Fragment key={exoIndex}>
                                    {exoIndex > 0 && <Divider orientation="vertical" justifySelf="center" h="auto" />}
                                    <ExerciseGridItem exo={exo} />
                                </Fragment>
                            ))}
                        </Grid>
                    </Fragment>
                );
            })}
        </Stack>
    );
}

function ExerciseGridItem({ exo }: { exo: Exercise }) {
    const toggle = useCompactState();

    return (
        <Flex flexDirection="column" w="100%" onClick={toggle.onToggle} cursor="pointer">
            <Flex w="100%" alignItems="flex-start">
                <Heading as="h4" size="sm" mr="2">
                    {exo.name}
                </Heading>
            </Flex>
            <ExerciseSetListOverview setList={exo.series} />
            <ExerciseTagList mt="2" tagList={exo.tags} isPreview={toggle.isHidden} />
            {toggle.isHidden ? null : (
                <>
                    <ExerciseSetList mt="2" fontSize="xs" setList={exo.series} />
                    <ExerciseNote exo={exo} />
                </>
            )}
        </Flex>
    );
}
