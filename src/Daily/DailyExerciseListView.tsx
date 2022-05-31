import { HFlex } from "@/components/HFlex";
import { ReorderItemBox } from "@/components/ReorderItemBox";
import { ExerciseListItem } from "@/Exercises/ExerciseListItem";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise, WithExerciseList } from "@/orm-types";
import { isDailyTodayAtom } from "@/store";
import { DragHandleIcon } from "@chakra-ui/icons";
import { Box, Flex, Icon } from "@chakra-ui/react";
import { Reorder, useMotionValue } from "framer-motion";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "react-query";

export const DailyExerciseListView = ({ exerciseList }: WithExerciseList) => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);
    return isDailyToday ? (
        <ReoderableExerciseListView exerciseList={exerciseList} />
    ) : (
        <Flex flexDirection="column" pt="2" pb="8" px="4" overflowY="auto">
            {exerciseList.map((exo) => (
                <Box key={exo.id} py="1" px="4">
                    <ExerciseListItem exo={exo} withExpand />
                </Box>
            ))}
        </Flex>
    );
};

const ReoderableExerciseListView = ({ exerciseList }: WithExerciseList) => {
    const daily = useCurrentDaily();
    const exerciseIdList = useMemo(() => daily.exerciseList.map((e) => e.id), [daily.exerciseList]);
    const [items, setItems] = useState(exerciseIdList);

    // Keep items up to date with daily.exerciseIdList whenever a exercise is created/deleted
    useEffect(() => {
        if (exerciseIdList.length === items.length) return;
        if (exerciseIdList.join() === items.join()) return;

        setItems(exerciseIdList);
    }, [exerciseIdList]);

    const mutation = useMutation((exerciseList: string[]) => orm.daily.upsert(daily.id, { exerciseList }), {
        onSuccess: () => daily.invalidate(),
    });

    return (
        <Box
            pt="2"
            pb="8"
            px="4"
            as={Reorder.Group}
            axis="y"
            values={items}
            // TODO react 18 transition
            onReorder={(newOrder) => setItems((current) => (newOrder.join() === current.join() ? current : newOrder))}
            listStyleType="none"
            layoutScroll
            overflowY="auto"
        >
            {items.map((item) => (
                <ReorderExerciseItem
                    key={item}
                    exercise={exerciseList.find((p) => p.id === item)}
                    onAnimationComplete={() => mutation.mutate(items)}
                />
            ))}
        </Box>
    );
};

const ReorderExerciseItem = ({
    exercise,
    onAnimationComplete,
}: {
    exercise: Exercise;
    onAnimationComplete: () => void;
}) => {
    const y = useMotionValue(0);
    return (
        <ReorderItemBox
            value={exercise.id}
            py="1"
            px="4"
            style={{ position: "relative", y }}
            whileDrag={{
                scale: 1.1,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                borderRadius: "8px",
            }}
            onAnimationComplete={(e: any) => e.scale === 1 && onAnimationComplete()}
        >
            <Flex bg="white">
                <ExerciseListItem exo={exercise} />
                <HFlex justifyContent="space-around" p="4" ml="auto">
                    <Icon as={DragHandleIcon} size="24px" />
                </HFlex>
            </Flex>
        </ReorderItemBox>
    );
};
