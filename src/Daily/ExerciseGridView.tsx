import { SwitchInput } from "@/components/SwitchInput";
import { ExerciseGrid } from "@/Exercises/ExerciseGrid";
import { useDaily, useExerciseList } from "@/orm-hooks";
import { gridCondensedViewAtom } from "@/store";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { useAtom } from "jotai";

export const ExerciseGridView = () => {
    const daily = useDaily();
    const exerciseList = useExerciseList({ index: "by-category", query: daily.category });

    const [gridCondensedView, setGridCondensedView] = useAtom(gridCondensedViewAtom);

    return (
        <Flex flexDir="column" overflow="auto" h="100%" pt="2" pb="8">
            <Stack p="2">
                <SwitchInput
                    ml="auto"
                    label="Condensed view"
                    labelProps={{ fontSize: "sm" }}
                    // wrapperProps={{ flexDirection: "row-reverse" }}
                    onChange={(e) => setGridCondensedView(e.target.checked)}
                    isChecked={gridCondensedView}
                />
                <Text>Available exercises in this category :</Text>
            </Stack>
            <ExerciseGrid exerciseList={exerciseList} />
        </Flex>
    );
};
