import { CustomDay } from "@/components/CalendarButton";
import { DynamicTable } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { SwitchInput } from "@/components/SwitchInput";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { groupBy } from "@/functions/groupBy";
import { displayDate, parseDate } from "@/functions/utils";
import { orm } from "@/orm";
import { useCategoryList, useDailyList } from "@/orm-hooks";
import { DailyWithReferences, ExerciseWithReferences } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { CheckIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Center,
    Divider,
    Heading,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Stack,
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    Tag,
    TagLabel,
    TagLeftIcon,
    Text,
    useDisclosure,
    useOutsideClick,
    VStack,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { getSum, SetState } from "@pastable/core";
import {
    Calendar,
    CalendarControls,
    CalendarDays,
    CalendarMonth,
    CalendarMonthName,
    CalendarMonths,
    CalendarNextButton,
    CalendarPrevButton,
    CalendarValues,
    CalendarWeek,
} from "@uselessdev/datepicker";
import { subMonths, subWeeks, subYears } from "date-fns";
import { ComponentPropsWithoutRef, MutableRefObject, ReactNode, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Link as ReactLink } from "react-router-dom";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { match } from "ts-pattern";

export const ProgressPage = () => {
    const [activeRange, setActiveRange] = useState<RangePresetOrCustom>("Week");
    const [dates, setDates] = useState<CalendarValues>({
        start: activeRange !== "custom" ? getRangeStart(activeRange as RangePreset) : null,
        end: new Date(),
    });
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
        <UnitModeContext value={unitMode}>
            <Box id="ProgressPage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
                <Box d="flex" alignItems="center" mb="4">
                    <Heading as="h1">Progress</Heading>
                    <SwitchInput
                        ml="auto"
                        label="Use %"
                        onChange={(e) => setUnitMode((current) => (current === "percent" ? "count" : "percent"))}
                    />
                </Box>
                <DateRangePresetPicker {...{ dates, setDates, activeRange, setActiveRange }} />
                <Heading as="h3" mt="4" fontSize="lg">
                    From {displayDate(dates.start)} to {displayDate(dates.end)}{" "}
                </Heading>
                <Box w="100%" h="300px" my="4">
                    <Show
                        when={dailyListInDateRangeQuery.status === "success"}
                        fallback={
                            <Center h="100%">
                                <Spinner size="xl" />
                            </Center>
                        }
                    >
                        <PieGraph data={data} />
                    </Show>
                </Box>
                <Show
                    when={dailyListInDateRangeQuery.status === "success"}
                    fallback={
                        <Center my="4">
                            <Spinner size="xl" />
                        </Center>
                    }
                >
                    <Divider mx="2" my="4" />
                    <StatTotals totals={totals} />
                </Show>
                <Show
                    when={exerciseListInDateRangeQuery.status === "success"}
                    fallback={
                        <Center my="4">
                            <Spinner size="xl" />
                        </Center>
                    }
                >
                    <Divider mx="2" my="4" />
                    <TopKgInDateRange exerciseList={exerciseList} />
                </Show>
            </Box>
        </UnitModeContext>
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

type UseStateProps<Name extends string, T> = { [key in Name]: T } & { [key in `set${Capitalize<Name>}`]: SetState<T> };

const DateRangePresetPicker = ({
    dates,
    setDates,
    activeRange,
    setActiveRange,
}: UseStateProps<"dates", CalendarValues> & UseStateProps<"activeRange", RangePresetOrCustom>) => {
    const rangeContainerRef = useRef<HTMLDivElement>();

    return (
        <CalendarValuesProvider value={{ ...dates, setDates }}>
            <Wrap ref={rangeContainerRef}>
                {rangePresets.map((value) => (
                    <WrapItem key={value}>
                        <Tag
                            colorScheme="pink"
                            variant={value === activeRange ? "solid" : "subtle"}
                            onClick={() => {
                                setActiveRange(value);
                                setDates({ start: getRangeStart(value as RangePreset), end: new Date() });
                            }}
                        >
                            {value === activeRange ? <TagLeftIcon boxSize="12px" as={CheckIcon} /> : null}
                            <TagLabel>{value}</TagLabel>
                        </Tag>
                    </WrapItem>
                ))}
                <WrapItem>
                    <CustomDateRangeCalendarButton
                        calendarRef={rangeContainerRef}
                        renderTrigger={({ onOpen }) => (
                            <Tag
                                colorScheme="pink"
                                variant={"custom" === activeRange ? "solid" : "subtle"}
                                onClick={() => {
                                    if (activeRange !== "custom") {
                                        setActiveRange("custom");
                                        setDates({ start: null, end: null });
                                    }

                                    return onOpen();
                                }}
                            >
                                {"custom" === activeRange ? <TagLeftIcon boxSize="12px" as={CheckIcon} /> : null}
                                <TagLabel>Custom</TagLabel>
                            </Tag>
                        )}
                    />
                </WrapItem>
            </Wrap>
        </CalendarValuesProvider>
    );
};

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
                <Legend verticalAlign="bottom" height={26} align="center" />
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

type UnitMode = "count" | "percent";
const [UnitModeContext, useUnitMode] = createContextWithHook<UnitMode>("UnitMode");

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const RADIAN = Math.PI / 180;

const getRangeStart = (preset: RangePreset) => {
    const today = new Date();
    return match(preset)
        .with("Week", () => subWeeks(today, 1))
        .with("1m", () => subMonths(today, 1))
        .with("3m", () => subMonths(today, 3))
        .with("6m", () => subMonths(today, 6))
        .with("1y", () => subYears(today, 1))
        .exhaustive();
};

const rangePresets = ["Week", "1m", "3m", "6m", "1y"] as const;
type RangePresetOrCustom = typeof rangePresets[number] | "custom";
type RangePreset = Exclude<RangePresetOrCustom, "custom">;

const [CalendarValuesProvider, useCalendarValues] = createContextWithHook<
    CalendarValues & { setDates: SetState<CalendarValues> }
>("CalendarValues");

const CustomDateRangeCalendarButton = ({
    renderTrigger,
    calendarRef,
}: {
    renderTrigger: (props: { onOpen: () => void }) => ReactNode;
    calendarRef: MutableRefObject<HTMLDivElement>;
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    useOutsideClick({ ref: calendarRef, handler: onClose, enabled: isOpen });

    return (
        <Popover placement="auto-start" isOpen={isOpen}>
            <PopoverTrigger>{renderTrigger({ onOpen })}</PopoverTrigger>
            <PopoverContent
                p={0}
                w="min-content"
                border="none"
                outline="none"
                _focus={{ boxShadow: "none" }}
                ref={calendarRef}
            >
                <TwoMonthsDateRangeCalendar onSelectDates={onClose} />
            </PopoverContent>
        </Popover>
    );
};

const MONTHS = 2;
const TwoMonthsDateRangeCalendar = ({ onSelectDates }: { onSelectDates: (dates: CalendarValues) => void }) => {
    const dailyList = useDailyList();
    const { setDates, ...dates } = useCalendarValues();
    const handleSelectDate = (dates: CalendarValues) => {
        console.log(dates);
        setDates(dates);
        if (dates.start && dates.end) {
            onSelectDates(dates);
        }
    };
    const categoryList = useCategoryList();

    return (
        <Calendar value={dates} onSelectDate={handleSelectDate} months={MONTHS} disableFutureDates>
            <Box d="flex" flexDir="column">
                <Box position="relative">
                    <CalendarControls>
                        <CalendarPrevButton />
                        <CalendarNextButton />
                    </CalendarControls>

                    <CalendarMonths gridTemplate="1fr 1fr / 1fr">
                        {[...Array(MONTHS).keys()].map((month) => (
                            <CalendarMonth month={month} key={month}>
                                <CalendarMonthName />
                                <CalendarWeek />
                                <CalendarDays>
                                    <CustomDay {...{ dailyList, categoryList }} />
                                </CalendarDays>
                            </CalendarMonth>
                        ))}
                    </CalendarMonths>
                </Box>
                <VStack spacing={4} bgColor="gray.50" p={4} alignItems="stretch" borderEndRadius="md" flex={1}>
                    <Button
                        onClick={() => setDates({ start: null, end: null })}
                        colorScheme="pink"
                        size="md"
                        disabled={!Boolean(dates.start || dates.end)}
                    >
                        Reset range
                    </Button>
                </VStack>
            </Box>
        </Calendar>
    );
};
