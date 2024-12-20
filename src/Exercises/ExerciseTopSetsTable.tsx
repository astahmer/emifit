import { AppExternalLinkIcon } from "@/components/AppExternalLinkIcon";
import { DynamicTable, DynamicTableProps, makeColumns } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { Exercise } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { Badge, Stack, Text } from "@chakra-ui/react";
import { findBy } from "pastable";
import { Link as ReactLink } from "react-router-dom";

export const ExerciseTopSetsTable = ({
    exerciseList,
    tableProps,
}: {
    exerciseList: Exercise[];
    tableProps: Omit<DynamicTableProps<ExerciseWithTops, typeof columns>, "data" | "columns">;
}) => {
    const { listWithTops, topKg, topReps } = getExerciseListWithTops(exerciseList);

    const data = listWithTops.map((exo) => ({
        ...exo,
        isTopKg: exo.topKg === topKg,
        isTopReps: exo.topReps === topReps,
    }));

    return (
        <DynamicTable
            isHeaderSticky
            initialSortBy={[{ id: "createdAt", desc: true }]}
            {...tableProps}
            columns={columns}
            data={data}
        />
    );
};

const columns = makeColumns<ExerciseWithTops>()([
    {
        header: "Date",
        accessorKey: "createdAt",
        sortingFn: "datetime",
        cell: (props) => (
            <Stack
                direction="row"
                as={ReactLink}
                to={`/daily/entry/${printDailyDate(new Date(props.getValue<string | Date>()))}`}
                color="pink.300"
                alignItems="center"
                spacing="1.5"
            >
                <AppExternalLinkIcon />
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
            const exo = props.row.original;
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
        header: "reps",
        accessorKey: "repsWithTopKg",
        cell: (props) => {
            const exo = props.row.original;
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
    {
        header: "top reps",
        accessorKey: "topReps",
        cell: (props) => {
            const exo = props.row.original;
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
    {
        header: "kg",
        accessorKey: "kgWithTopReps",
        cell: (props) => {
            const exo = props.row.original;
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
]);

export interface ExerciseWithTops extends Exercise {
    isTopKg: boolean;
    isTopReps: boolean;
    topKg: number;
    repsWithTopKg: number;
    topReps: number;
    kgWithTopReps: number;
}

export function getExerciseListWithTops(exerciseList: Exercise[]) {
    const listWithTops = exerciseList.map((exo) => {
        const topKg = Math.max(...exo.series.map((set) => set.kg));
        const topReps = Math.max(...exo.series.map((set) => set.reps));
        return {
            ...exo,
            createdAt: new Date(exo.createdAt),
            topKg,
            repsWithTopKg: exo.series.find((set) => set.kg === topKg).reps,
            topReps,
            kgWithTopReps: exo.series.find((set) => set.reps === topReps).kg,
        };
    });

    const topKg = Math.max(...listWithTops.map((exo) => exo.topKg));
    const topReps = Math.max(...listWithTops.map((exo) => exo.topReps));

    return { topKg, topReps, listWithTops };
}
