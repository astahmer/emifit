import { DynamicTable } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { SwitchInput } from "@/fields/SwitchInput";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { groupBy } from "@/functions/groupBy";
import { displayDate, parseDate } from "@/functions/utils";
import { orm } from "@/orm";
import { useCategoryList } from "@/orm-hooks";
import { DailyWithReferences, ExerciseWithReferences } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Divider, Heading, Stack, Stat, StatGroup, StatLabel, StatNumber, Text } from "@chakra-ui/react";
import { getSum } from "@pastable/core";
import { CalendarValues } from "@uselessdev/datepicker";
import { ComponentPropsWithoutRef, useState } from "react";
import { useQuery } from "react-query";
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

    const data = Object.entries(byCategory).map(([category, dailyList]) => ({
        name: categoryList.find((cat) => cat.id === category)?.name,
        value: dailyList.length,
    }));

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
            <Box d="flex" flexDir="column" position="sticky" top="0" bgColor="white" pb="4">
                <Box d="flex" alignItems="center" mb="4">
                    <Heading as="h3" fontSize="sm" whiteSpace="nowrap">
                        From {displayDate(dates.start)} to {displayDate(dates.end)}{" "}
                    </Heading>
                    <SwitchInput
                        ml="auto"
                        label="Use %"
                        onChange={(e) => setUnitMode((current) => (current === "percent" ? "count" : "percent"))}
                    />
                </Box>
                <DateRangePresetPicker />
            </Box>
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
            dailyDate: parseDate(exo.dailyId),
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
                initialSortBy={[{ id: "dailyDate", desc: true }]}
            />
        </>
    );
};

const columns = [
    {
        Header: "Date",
        accessor: "dailyDate",
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
                    {new Date(props.row.original.dailyId).toLocaleDateString()}
                </Text>
            </Stack>
        ),
    },
    { Header: "Exo", accessor: "name" },
    { Header: "Kg", accessor: "topKg" },
    { Header: "Reps", accessor: "topReps" },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const RADIAN = Math.PI / 180;
const PieGraph = ({ data }: Pick<ComponentPropsWithoutRef<typeof Pie>, "data">) => {
    const unitMode = useUnitMode();

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
                    {data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
