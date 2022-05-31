import { ExpandButton, useCompactState } from "@/Daily/ExpandButton";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { Exercise } from "@/orm-types";
import { Flex, Heading } from "@chakra-ui/react";
import { ExerciseSetList, ExerciseSetListOverview } from "./ExerciseSetList";

export function ExerciseListItem({ exo, withExpandButton }: { exo: Exercise; withExpandButton?: boolean }) {
    const toggle = useCompactState();

    return (
        <Flex flexDirection="column" w="100%">
            <Flex w="100%" alignItems="flex-end">
                <Heading as="h4" size="md">
                    {exo.name}
                </Heading>
                {withExpandButton && <ExpandButton ml="auto" isActive={toggle.isOpen} onClick={toggle.onToggle} />}
            </Flex>
            <ExerciseSetListOverview setList={exo.series} />
            <ExerciseTagList mt="2" tagList={exo.tags} isHidden={toggle.isHidden} />
            {toggle.isHidden ? null : <ExerciseSetList mt="2" fontSize="xs" setList={exo.series} />}
        </Flex>
    );
}
