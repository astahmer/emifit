import { Scrollable } from "@/components/Scrollable";
import { ExerciseTag } from "@/Exercises/ExerciseTag";
import { Exercise, WithExerciseList } from "@/orm-types";
import { isCompactViewAtom } from "@/store";
import {
    Box,
    Divider,
    Flex,
    Grid,
    Heading,
    ListItem,
    Stack,
    Text,
    UnorderedList,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { chunk, WithChildren } from "@pastable/core";
import { useAtomValue } from "jotai";
import { Fragment } from "react";
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
    const isCompact = useAtomValue(isCompactViewAtom);

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
                                    {exoIndex > 0 && <Divider orientation="vertical" justifySelf="center" />}
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
    const isCompact = useAtomValue(isCompactViewAtom);

    return (
        <Flex>
            <Flex flexDirection="column" w="100%">
                <Flex w="100%" alignItems="flex-end">
                    <Heading as="h4" size="sm">
                        {exo.name}
                    </Heading>
                </Flex>
                <ExerciseSetListOverview setList={exo.series} />
                <Wrap mt="2">
                    {exo.tags.slice(0, isCompact ? 2 : undefined).map((tag) => (
                        <WrapItem key={tag.id}>
                            <ExerciseTag tag={tag} />
                        </WrapItem>
                    ))}
                    {isCompact && exo.tags.length > 2 ? (
                        <WrapItem>
                            <ExerciseTag tag={{ id: "...", label: "...", group: "none" }} />
                        </WrapItem>
                    ) : null}
                </Wrap>
                {isCompact ? null : <ExerciseSetList mt="2" fontSize="xs" setList={exo.series} />}
            </Flex>
        </Flex>
    );
}
