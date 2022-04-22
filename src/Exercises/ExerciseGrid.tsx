import { ExerciseTag } from "@/Exercises/ExerciseTag";
import { Exercise } from "@/orm-types";
import { gridCondensedViewAtom } from "@/store";
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
import { chunk } from "@pastable/core";
import { useAtomValue } from "jotai";
import { Fragment } from "react";

export function ExerciseGrid({ exerciseList }: { exerciseList: Exercise[] }) {
    return (
        <Stack p="4">
            {chunk(exerciseList, 2).map((chunk, index) => {
                return (
                    <Fragment key={index}>
                        {index > 0 && (
                            <Box px="8">
                                <Divider my="2" />
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
    const isCondensed = useAtomValue(gridCondensedViewAtom);

    return (
        <Flex>
            <Flex flexDirection="column" w="100%">
                <Flex w="100%" alignItems="flex-end">
                    <Heading as="h4" size="sm">
                        {exo.name}
                    </Heading>
                </Flex>
                <Text fontWeight="normal" fontSize="xs" color="gray.500">
                    {exo.series.length} sets of {exo.series.map((set) => set.reps).join("/")} reps
                </Text>
                <Wrap mt="2">
                    {exo.tags.slice(0, isCondensed ? 2 : undefined).map((tag) => (
                        <WrapItem key={tag.id}>
                            <ExerciseTag tag={tag} />
                        </WrapItem>
                    ))}
                    {isCondensed && exo.tags.length > 2 ? (
                        <WrapItem>
                            <ExerciseTag tag={{ id: "...", label: "...", group: "none" }} />
                        </WrapItem>
                    ) : null}
                </Wrap>
                {isCondensed ? null : (
                    <UnorderedList mt="2" fontSize="xs">
                        {exo.series.map((serie) => (
                            <ListItem key={serie.id}>
                                {serie.kg} kg / {serie.reps} reps
                            </ListItem>
                        ))}
                    </UnorderedList>
                )}
            </Flex>
        </Flex>
    );
}
