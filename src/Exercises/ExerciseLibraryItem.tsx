import { DynamicTable } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Flex,
    Stack,
    Text,
    useAccordionContext,
} from "@chakra-ui/react";
import { findBy } from "@pastable/core";
import { Link as ReactLink } from "react-router-dom";
import { Row } from "react-table";

export const ExerciseLibraryItem = ({
    exercise,
    index,
    exerciseList,
}: {
    exercise: Exercise;
    index: number;
    exerciseList: Exercise[];
}) => {
    const ctx = useAccordionContext();

    const listWithTops = exerciseList.map((exo) => ({
        ...exo,
        createdAt: new Date(exo.createdAt),
        topKg: Math.max(...exo.series.map((set) => set.kg)),
        topReps: Math.max(...exo.series.map((set) => set.reps)),
    }));

    const topKg = Math.max(...listWithTops.map((exo) => exo.topKg));
    const topReps = Math.max(...listWithTops.map((exo) => exo.topReps));

    const data = listWithTops.map((exo) => ({
        ...exo,
        isTopKg: exo.topKg === topKg,
        isTopReps: exo.topReps === topReps,
    }));
    const isFocused = ctx.focusedIndex === index;

    return (
        <AccordionItem w="100%" isDisabled={!exerciseList.length}>
            <AccordionButton w="100%">
                <Stack direction="row" alignItems="center" w="100%">
                    <Stack alignItems="flex-start" w="100%">
                        <Flex alignItems="flex-start">
                            <Text mr="1">{exercise.name}</Text>
                            <Text fontSize="xs">({exerciseList.length})</Text>
                        </Flex>
                        {Boolean(exercise.tags?.length) && <ExerciseTagList tagList={exercise.tags} />}
                    </Stack>
                </Stack>
                <Show when={ctx.index === index}>
                    <Stack mx="2">
                        <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                            Top kg {topKg}
                        </Badge>
                        <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                            Top reps {topReps}
                        </Badge>
                    </Stack>
                </Show>
                {Boolean(exerciseList.length) && <AccordionIcon ml="auto" />}
            </AccordionButton>
            <AccordionPanel
                pb={4}
                borderWidth="1px"
                borderColor="pink.100"
                borderRadius="md"
                borderTopLeftRadius={0}
                borderTopRightRadius={0}
                sx={{ th: { whiteSpace: "nowrap" } }}
            >
                {isFocused && (
                    <DynamicTable
                        columns={columns}
                        data={data}
                        isHeaderSticky
                        initialSortBy={[{ id: "createdAt", desc: true }]}
                    />
                )}
            </AccordionPanel>
        </AccordionItem>
    );
};
const columns = [
    {
        Header: "Date",
        accessor: "createdAt",
        sortType: "datetime",
        Cell: (props) => (
            <Stack
                direction="row"
                as={ReactLink}
                to={`/daily/entry/${printDailyDate(new Date(props.value))}`}
                color="pink.300"
                alignItems="center"
                spacing="1.5"
            >
                <ExternalLinkIcon color="pink.700" opacity="0.6" boxSize="3" />
                <Text color="pink.300" fontWeight="bold">
                    {new Date(props.value).toLocaleDateString()}
                </Text>
            </Stack>
        ),
    },
    {
        Header: "top kg",
        accessor: "topKg",
        Cell: (props) => {
            const exo = props.row.original as ExerciseWithTops;
            const list = props.sortedRows as Row<ExerciseWithTops>[];

            const sortedIndex = findBy(list, "original.id", exo.id, true);
            const next = list[sortedIndex + 1];
            const diff = sortedIndex < list.length - 1 ? exo.topKg - next?.original.topKg : 0;

            return (
                <Stack direction="row" alignItems="center">
                    <Text {...(exo.isTopKg ? { color: "pink.300", fontWeight: "bold" } : undefined)}>
                        {props.value}
                    </Text>
                    <Show when={diff !== 0}>
                        <Badge
                            variant="subtle"
                            colorScheme={diff > 0 ? "whatsapp" : "red"}
                            fontSize="x-small"
                            fontStyle="italic"
                        >
                            {diff > 0 ? "+" + diff : diff}
                        </Badge>
                    </Show>
                </Stack>
            );
        },
    },
    {
        Header: "top reps",
        accessor: "topReps",
        Cell: (props) => {
            const exo = props.row.original as ExerciseWithTops;
            const list = props.sortedRows as Row<ExerciseWithTops>[];

            const sortedIndex = findBy(list, "original.id", exo.id, true);
            const next = list[sortedIndex + 1];
            const diff = sortedIndex < list.length - 1 ? exo.topReps - next?.original.topReps : 0;

            return (
                <Stack direction="row" alignItems="center">
                    <Text {...(exo.isTopReps ? { color: "pink.300", fontWeight: "bold" } : undefined)}>
                        {props.value}
                    </Text>
                    <Show when={diff !== 0}>
                        <Badge
                            variant="subtle"
                            colorScheme={diff > 0 ? "whatsapp" : "red"}
                            fontSize="x-small"
                            fontStyle="italic"
                        >
                            {diff > 0 ? "+" + diff : diff}
                        </Badge>
                    </Show>
                </Stack>
            );
        },
    },
];
interface ExerciseWithTops extends Exercise {
    isTopKg: boolean;
    isTopReps: boolean;
    topKg: number;
    topReps: number;
}
