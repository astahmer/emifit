import { AppExternalLinkIcon } from "@/components/AppExternalLinkIcon";
import { DynamicTable } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { VFlex } from "@/components/VFlex";
import { SwitchInput } from "@/fields/SwitchInput";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { groupBy } from "@/functions/groupBy";
import { displayDate } from "@/functions/utils";
import { orm } from "@/orm";
import { useCategoryList } from "@/orm-hooks";
import { DailyWithReferences, ExerciseWithReferences } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import {
    Box,
    Divider,
    Flex,
    Heading,
    Stack,
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    Text,
    useTheme,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CalendarValues } from "@uselessdev/datepicker";
import { get, getSum } from "pastable";
import { useState } from "react";
import { Link as ReactLink } from "react-router-dom";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { DateRangePresetPicker, getRangeStart } from "../Calendar/DateRangePresetPicker";
import { CalendarValuesProvider } from "../Calendar/useCalendarValues";
import { CenteredSpinner } from "./CenteredSpinner";

export type UnitMode = "count" | "percent";
const [UnitModeContext, useUnitMode] = createContextWithHook<UnitMode>("UnitMode");

export const ProgressTab = () => {
    const [dates, setDates] = useState<CalendarValues>({ start: getRangeStart("1 week"), end: new Date() });
    const dailyListInDateRangeQuery = useQuery(
        ["stats", dates, "daily"],
        async () => {
            const tx = orm.db.transaction("daily");

            let cursor = await tx.store
                .index("by-time")
                .openCursor(IDBKeyRange.bound(new Date(dates.start).getTime(), new Date(dates.end).getTime()));

            const list = [] as DailyWithReferences[];
            while (cursor) {
                list.push(cursor.value);

                cursor = await cursor.continue();
            }

            return list;
        },
        { enabled: Boolean(dates.start && dates.end), staleTime: 5 * 60 * 1000 }
    );
    const dailyList = dailyListInDateRangeQuery.data || [];

    const categoryList = useCategoryList();
    const byCategory = groupBy(dailyList, (daily) => daily.category);

    const theme = useTheme();
    const data = Object.entries(byCategory).map(([catId, dailyList]) => {
        const category = categoryList.find((cat) => cat.id === catId);
        return { name: category.name, color: get(theme.colors, category.color || "pink.300"), value: dailyList.length };
    });

    const [unitMode, setUnitMode] = useState<UnitMode>("count");
    const totals: StatsTotalByKind = {
        daily: dailyList.length,
        exercise: getSum(dailyList.map((d) => d.exerciseList.length)),
        cardio:
            unitMode === "count"
                ? getSum(dailyList.map((d) => (d.hasDoneCardio ? 1 : 0)))
                : (100 * (getSum(dailyList.map((d) => (d.hasDoneCardio ? 1 : 0))) / dailyList.length)).toFixed(1) + "%",
    };

    const exerciseListInDateRangeQuery = useQuery(
        ["stats", dates, "exercise"],
        async () => {
            const tx = orm.db.transaction("exercise");

            let cursor = await tx.store
                .index("by-created-date")
                .openCursor(IDBKeyRange.bound(new Date(dates.start), new Date(dates.end)));

            const list = [] as ExerciseWithReferences[];
            while (cursor) {
                if (cursor.value.from === "daily") {
                    list.push(cursor.value);
                }

                cursor = await cursor.continue();
            }

            return list;
        },
        { enabled: Boolean(dates.start && dates.end), staleTime: 5 * 60 * 1000 }
    );
    const exerciseList = exerciseListInDateRangeQuery.data || [];

    return (
        <CalendarValuesProvider value={{ ...dates, setDates }}>
            <VFlex position="sticky" top="0" bgColor="white" pb="4">
                <Flex alignItems="center" mb="4">
                    <Heading as="h3" fontSize="sm" whiteSpace="nowrap">
                        From {displayDate(dates.start)} to {displayDate(dates.end)}{" "}
                    </Heading>
                    <SwitchInput
                        ml="auto"
                        label="Use %"
                        onChange={(e) => setUnitMode((current) => (current === "percent" ? "count" : "percent"))}
                    />
                </Flex>
                <DateRangePresetPicker />
            </VFlex>
            <UnitModeContext value={unitMode}>
                <Box w="100%" h="300px" my="4">
                    {/* TODO circle skeleton */}
                    <Show when={dailyListInDateRangeQuery.status === "success"} fallback={<CenteredSpinner h="100%" />}>
                        <PieGraph data={data} />
                    </Show>
                </Box>
                {/* TODO skeletons */}
                <Show when={dailyListInDateRangeQuery.status === "success"} fallback={<CenteredSpinner my="4" />}>
                    <Divider mx="2" my="4" />
                    <StatTotals totals={totals} />
                </Show>
                {/* TODO skeletons */}
                <Show when={exerciseListInDateRangeQuery.status === "success"} fallback={<CenteredSpinner my="4" />}>
                    <Divider mx="2" my="4" />
                    <TopKgInDateRange exerciseList={exerciseList} />
                </Show>
            </UnitModeContext>
        </CalendarValuesProvider>
    );
};

const TopKgInDateRange = ({ exerciseList }: { exerciseList: ExerciseWithReferences[] }) => {
    const topKgInDateRange = Math.max(...exerciseList.flatMap((exo) => exo.series.map((set) => set.kg)));
    const exerciseListWithTopKgs = exerciseList
        .filter((exo) => exo.series.some((set) => set.kg === topKgInDateRange))
        .map((exo) => ({
            ...exo,
            topKg: Math.max(...exo.series.map((set) => set.kg)),
            topReps: Math.max(...exo.series.map((set) => set.reps)),
        }));

    return (
        <>
            <Heading as="h2" mb="4" fontSize="xl">
                Top kg in that period
            </Heading>
            <DynamicTable
                columns={columns}
                data={exerciseListWithTopKgs}
                initialSortBy={[{ id: "createdAt", desc: true }]}
            />
        </>
    );
};

type ExerciseWithTopKgAndReps = ExerciseWithReferences & { topKg: number; topReps: number };

const makeExoColumn = createColumnHelper<ExerciseWithTopKgAndReps>();
const columns = [
    makeExoColumn.accessor("createdAt", {
        header: "Date",
        sortingFn: "datetime",
        cell: (props) => (
            <Stack
                direction="row"
                as={ReactLink}
                to={`/daily/entry/${printDailyDate(new Date(props.getValue()))}`}
                color="pink.300"
                alignItems="center"
                spacing="1.5"
            >
                <AppExternalLinkIcon />
                <Text color="pink.300" fontWeight="bold">
                    {new Date(props.row.original.dailyId).toLocaleDateString()}
                </Text>
            </Stack>
        ),
    }),
    {
        header: "Exo",
        accessorKey: "name",
        cell: (props) => (
            <Stack
                direction="row"
                as={ReactLink}
                to={`/inspect/${props.row.original.slug}`}
                color="pink.300"
                alignItems="center"
                spacing="1.5"
            >
                <AppExternalLinkIcon />
                <Text color="pink.300" fontWeight="bold">
                    {props.renderValue<string>()}
                </Text>
            </Stack>
        ),
    },
    { header: "Kg", accessorKey: "topKg" },
    { header: "Reps", accessorKey: "topReps" },
] as Array<ColumnDef<ExerciseWithTopKgAndReps>>;

const RADIAN = Math.PI / 180;
const PieGraph = ({ data }: { data: Array<{ name: string; color: string; value: number }> }) => {
    const unitMode = useUnitMode();

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                <Pie
                    animationDuration={400}
                    data={data}
                    // cx={rect.width / 2 - 10}
                    // cy={rect.width / 2 - 10}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, ...props }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                            <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor={x > cx ? "start" : "middle"}
                                dominantBaseline="central"
                            >
                                {unitMode === "percent" ? `${(percent * 100).toFixed(0)}%` : value}
                            </text>
                        );
                    }}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

type StatsTotalByKind = { daily: number; exercise: number; cardio: number | string };
const StatTotals = ({ totals }: { totals: StatsTotalByKind }) => {
    return (
        <StatGroup>
            <Stat alignSelf="center">
                <StatLabel>Totals</StatLabel>
            </Stat>
            <Stat>
                <StatLabel>daily</StatLabel>
                <StatNumber>{totals.daily}</StatNumber>
            </Stat>
            <Stat>
                <StatLabel>exercise</StatLabel>
                <StatNumber>{totals.exercise}</StatNumber>
            </Stat>
            <Stat>
                <StatLabel>cardio</StatLabel>
                <StatNumber>{totals.cardio}</StatNumber>
            </Stat>
        </StatGroup>
    );
};
