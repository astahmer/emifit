import { Scrollable } from "@/components/Scrollable";
import { ExpandButton } from "@/Daily/CompactButton";
import { ExerciseTag } from "@/Exercises/ExerciseTag";
import { Exercise, WithExerciseList } from "@/orm-types";
import { isCompactViewAtom } from "@/store";
import {
    Box,
    Divider,
    Flex,
    Grid,
    Heading,
    HStack,
    IconButton,
    ListItem,
    Stack,
    Text,
    UnorderedList,
    useDisclosure,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { chunk, WithChildren } from "@pastable/core";
import { useAtomValue } from "jotai";
import { Fragment, useEffect, useRef, useState } from "react";
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
    const isCompact = useAtomValue(isCompactViewAtom);
    const toggle = useDisclosure({ defaultIsOpen: false });
    const isHidden = !toggle.isOpen;

    const isFirstRenderRef = useRef(true);
    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        if (!isCompact) {
            toggle.onOpen();
        } else {
            toggle.onClose();
        }
    }, [isCompact]);

    return (
        <Flex>
            <Flex flexDirection="column" w="100%">
                <Flex w="100%" alignItems="flex-start">
                    <Heading as="h4" size="sm" mr="2">
                        {exo.name}
                    </Heading>
                    <ExpandButton ml="auto" isActive={toggle.isOpen} onClick={toggle.onToggle} />
                </Flex>
                <ExerciseSetListOverview setList={exo.series} />
                <Wrap mt="2">
                    {exo.tags.slice(0, isHidden ? 2 : undefined).map((tag) => (
                        <WrapItem key={tag.id}>
                            <ExerciseTag tag={tag} />
                        </WrapItem>
                    ))}
                    {isHidden && exo.tags.length > 2 ? (
                        <WrapItem>
                            <ExerciseTag tag={{ id: "...", label: "...", group: "none" }} />
                        </WrapItem>
                    ) : null}
                </Wrap>
                {isHidden ? null : <ExerciseSetList mt="2" fontSize="xs" setList={exo.series} />}
            </Flex>
        </Flex>
    );
}
