import { useCompactState } from "@/Daily/ExpandButton";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { Exercise } from "@/orm-types";
import { Flex, Heading } from "@chakra-ui/react";
import { ExerciseSetList, ExerciseSetListOverview } from "./ExerciseSetList";

export function ExerciseListItem({ exo, withExpand }: { exo: Exercise; withExpand?: boolean }) {
    const toggle = useCompactState();

    return (
        <Flex
            flexDirection="column"
            w="100%"
            onClick={withExpand ? toggle.onToggle : undefined}
            cursor={withExpand ? "pointer" : undefined}
        >
            <Flex w="100%" alignItems="flex-end">
                <Heading as="h4" size="md">
                    {exo.name}
                </Heading>
            </Flex>
            <ExerciseSetListOverview setList={exo.series} />
            <ExerciseTagList mt="2" tagList={exo.tags} isHidden={toggle.isHidden} />
            {toggle.isHidden ? null : <ExerciseSetList mt="2" fontSize="xs" setList={exo.series} />}
        </Flex>
    );
}
