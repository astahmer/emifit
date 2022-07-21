import { DynamicTable } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { Exercise } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Badge, Stack, Text } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { findBy } from "pastable";
import { Link as ReactLink } from "react-router-dom";

export const ExerciseTopSetsTable = ({ exerciseList }: { exerciseList: Exercise[] }) => {
    const { listWithTops, topKg, topReps } = getExerciseListWithTops(exerciseList);

    const data = listWithTops.map((exo) => ({
        ...exo,
        isTopKg: exo.topKg === topKg,
        isTopReps: exo.topReps === topReps,
    }));

    return (
        <DynamicTable columns={columns} data={data} isHeaderSticky initialSortBy={[{ id: "createdAt", desc: true }]} />
    );
};

const columns = [
    {
        header: "Date",
        accessorKey: "createdAt",
        sortType: "datetime",
        cell: (props) => (
            <Stack
                direction="row"
                as={ReactLink}
                to={`/daily/entry/${printDailyDate(new Date(props.getValue<string | Date>()))}`}
                color="pink.300"
                alignItems="center"
                spacing="1.5"
            >
                <ExternalLinkIcon color="pink.700" opacity="0.6" boxSize="3" />
                <Text color="pink.300" fontWeight="bold">
                    {new Date(props.getValue<string | Date>()).toLocaleDateString()}
                </Text>
            </Stack>
        ),
    },
    {
        header: "top kg",
        accessorKey: "topKg",
        cell: (props) => {
            const exo = props.row.original as ExerciseWithTops;
            const list = props.table.getSortedRowModel().rows;

            const sortedIndex = findBy(list, "original.id", exo.id, true);
            const next = list[sortedIndex + 1];
            const diff = sortedIndex < list.length - 1 ? exo.topKg - next?.original.topKg : 0;

            return (
                <Stack direction="row" alignItems="center">
                    <Text {...(exo.isTopKg ? { color: "pink.300", fontWeight: "bold" } : undefined)}>
                        {props.getValue<number>()}
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
        header: "top reps",
        accessorKey: "topReps",
        cell: (props) => {
            const exo = props.row.original as ExerciseWithTops;
            const list = props.table.getSortedRowModel().rows;

            const sortedIndex = findBy(list, "original.id", exo.id, true);
            const next = list[sortedIndex + 1];
            const diff = sortedIndex < list.length - 1 ? exo.topReps - next?.original.topReps : 0;

            return (
                <Stack direction="row" alignItems="center">
                    <Text {...(exo.isTopReps ? { color: "pink.300", fontWeight: "bold" } : undefined)}>
                        {props.getValue<number>()}
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
] as Array<ColumnDef<ExerciseWithTops>>;

export interface ExerciseWithTops extends Exercise {
    isTopKg: boolean;
    isTopReps: boolean;
    topKg: number;
    topReps: number;
}

export function getExerciseListWithTops(exerciseList: Exercise[]) {
    const listWithTops = exerciseList.map((exo) => ({
        ...exo,
        createdAt: new Date(exo.createdAt),
        topKg: Math.max(...exo.series.map((set) => set.kg)),
        topReps: Math.max(...exo.series.map((set) => set.reps)),
    }));

    const topKg = Math.max(...listWithTops.map((exo) => exo.topKg));
    const topReps = Math.max(...listWithTops.map((exo) => exo.topReps));

    return { topKg, topReps, listWithTops };
}
