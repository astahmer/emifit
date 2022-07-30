import { useCompactState } from "@/Daily/ExpandButton";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { Exercise } from "@/orm-types";
import { Flex, Heading, UseDisclosureProps } from "@chakra-ui/react";
import { ExerciseNote } from "./ExerciseNote";
import { ExerciseSetList, ExerciseSetListOverview } from "./ExerciseSetList";

export function ExerciseListItem({
    exo,
    withExpand,
    disclosureProps,
    shouldShowAllTags,
    withSetListOverview,
}: {
    exo: Exercise;
    withExpand?: boolean;
    disclosureProps?: UseDisclosureProps;
    shouldShowAllTags?: boolean;
    withSetListOverview?: boolean;
}) {
    const toggle = useCompactState(disclosureProps);

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
            {withSetListOverview && <ExerciseSetListOverview setList={exo.series} />}
            <ExerciseTagList mt="2" tagList={exo.tags} isPreview={shouldShowAllTags ? false : toggle.isHidden} />
            {toggle.isHidden ? null : (
                <>
                    <ExerciseSetList mt="2" fontSize="xs" setList={exo.series} />
                    <ExerciseNote exo={exo} />
                </>
            )}
        </Flex>
    );
}
