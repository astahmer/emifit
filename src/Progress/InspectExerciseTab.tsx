import { CustomDateRangeCalendarButton } from "@/Calendar/CustomDateRangeCalendarButton";
import {
    DateRangePresetPicker,
    defaultDateRangePresets,
    FallbackDatesProvider,
    getFallbackDates,
    getInferedDateRangePreset,
    getRangeStart,
} from "@/Calendar/DateRangePresetPicker";
import { CalendarPropsProvider } from "@/Calendar/TwoMonthsDateRangeCalendar";
import { CalendarValuesProvider, useCalendarValues } from "@/Calendar/useCalendarValues";
import { DynamicTable } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { VFlex } from "@/components/VFlex";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { ExerciseTopSetsTable } from "@/Exercises/ExerciseTopSetsTable";
import { displayDate, getListStats, median } from "@/functions/utils";
import { ViewLayout } from "@/Layout";
import { useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { ArrowBackIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Divider,
    Flex,
    Grid,
    GridItem,
    GridItemProps,
    Heading,
    IconButton,
    Stack,
    Stat,
    StatArrow,
    StatGroup,
    StatHelpText,
    StatLabel,
    StatNumber,
    Tab,
    TabList,
    Tabs,
    Tag,
    TagLabel,
    Text,
    useConst,
    useTabsContext,
    useTheme,
} from "@chakra-ui/react";
import { CalendarValues } from "@uselessdev/datepicker";
import { differenceInDays, formatDistance, subDays } from "date-fns";
import { createContextWithHook, get, getSum, roundTo, sortBy } from "pastable";
import { ComponentPropsWithoutRef, PropsWithChildren, ReactNode, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { match } from "ts-pattern";
import { CenteredSpinner } from "./CenteredSpinner";

export const InspectExerciseTab = () => {
    const { exoSlug } = useParams();
    const query = useExerciseUnsortedList({ index: "by-slug", query: exoSlug });

    const [dates, setDates] = useState<CalendarValues>({ start: getRangeStart("1m"), end: new Date() });
    const exerciseList = sortBy(
        (query.data || []).filter((exo) => exo.from === "daily"),
        "createdAt"
    );
    const exerciseListInDateRange = exerciseList.filter(
        (exo) => exo.createdAt >= dates.start && exo.createdAt <= dates.end
    );

    return (
        <Show when={Boolean(query.data?.length)} fallback={<CenteredSpinner h="100%" />}>
            <DailyExerciseListProvider value={exerciseList}>
                <LastExerciseProvider value={(query.data || []).at(-1)}>
                    <CalendarValuesProvider value={{ ...dates, setDates }}>
                        <ExerciseListInDateRangeProvider value={exerciseListInDateRange}>
                            <ViewLayout>
                                <InspectExerciseTabContent />
                            </ViewLayout>
                        </ExerciseListInDateRangeProvider>
                    </CalendarValuesProvider>
                </LastExerciseProvider>
            </DailyExerciseListProvider>
        </Show>
    );
};

const [ExerciseListInDateRangeProvider, useExerciseListInDateRangeCtx] =
    createContextWithHook<Exercise[]>("ExerciseListCtx");

const [DailyExerciseListProvider, useDailyExericseListCtx] = createContextWithHook<Exercise[]>("DailyExerciseListCtx");

const [LastExerciseProvider, useLastExerciseCtx] = createContextWithHook<Exercise>("LastExerciseCtx");

const InspectExerciseTabContent = () => {
    const dates = useCalendarValues();
    const exerciseListInDateRange = useExerciseListInDateRangeCtx();
    const exerciseListWithTops = exerciseListInDateRange.map(getExerciseTops);

    return (
        <>
            <VFlex px="4" pt="4">
                <InspectExerciseHeader exerciseListWithTops={exerciseListWithTops} />
                <Divider mt="4" />
            </VFlex>
            <VFlex h="100%" minH={0} bgColor="gray.100">
                <VFlex px="4" pos="relative" overflow="hidden">
                    <Box
                        pos="absolute"
                        left="50%"
                        transform="translateX(-50%)"
                        borderBottomRadius="50%"
                        bgColor="white"
                        bottom="10px"
                        w="140%"
                        h="100%"
                    />
                    {/* TODO Dropdown avec les presets quand on clique plutôt que tout dispo via Flex ? */}

                    <InspectExerciseDateRange />
                    <Divider mt="2" />
                </VFlex>
                <ViewLayout pb="60px">
                    <Grid
                        h="100%"
                        minH={0}
                        overflowX="hidden"
                        overflowY="auto"
                        gap="6"
                        p="4"
                        rounded="lg"
                        gridAutoRows="minmax(55px, 1fr)"
                        gridTemplateColumns="1fr 1fr"
                    >
                        {/* Le même à faire dans Progress (pas spécifique à un exo mais tous) */}
                        <Card colSpan={2} rowSpan={3}>
                            <ProgressSinceDate
                                renderTitle={(since) => (
                                    <Stack spacing={1} mb="2">
                                        <Text fontSize="md" fontWeight="bold">
                                            Progress compared to the last period:
                                        </Text>
                                        <Text fontSize="sm" whiteSpace="nowrap">
                                            {displayDate(since)} - {displayDate(dates.start)}
                                        </Text>
                                    </Stack>
                                )}
                            />
                        </Card>
                        <Card colSpan={2} rowSpan={7}>
                            <Text fontSize="md" fontWeight="bold" mb="1">
                                Top kg/reps (by day)
                            </Text>
                            <Box my="auto">
                                <ExerciseWithTopKgAndRepsTableAndCharts exerciseListWithTops={exerciseListWithTops} />
                            </Box>
                        </Card>
                        <Card colSpan={2} rowSpan={4}>
                            <Text fontSize="md" fontWeight="bold" whiteSpace="nowrap">
                                Usage by tag
                            </Text>
                            <ByTagPieGraph />
                        </Card>
                        <Card colSpan={2} rowSpan={4}>
                            <Stack direction="row" fontSize="md" fontWeight="bold" alignItems="flex-start" spacing={1}>
                                <div>Total volume</div>
                                <Text as="span" fontStyle="italic" fontSize="xs">
                                    (kg * reps)
                                </Text>
                                <div>by day</div>
                            </Stack>
                            <Box w="100%" h="100%" mt="2">
                                <TotalKgVolumeLineGraph />
                            </Box>
                        </Card>
                        <Card colSpan={2} rowSpan={3}>
                            <Text fontSize="md" fontWeight="bold">
                                Stats (by day)
                            </Text>
                            <Box w="100%" h="100%" mt="2" maxH="100%" overflow="auto">
                                <StatsTable />
                            </Box>
                        </Card>
                        {/* TODO History page:
                        vue comme Google Agenda où on a une liste avec :
                        1 ligne (ou card) = 1 jour et on voit la catégorie + le nom des exos, liste scrollable */}
                        <Card rowSpan={4}>
                            <Text fontSize="md" fontWeight="bold">
                                History
                            </Text>
                        </Card>
                    </Grid>
                </ViewLayout>
            </VFlex>
        </>
    );
};

const Card = (props: GridItemProps) => {
    return <GridItem display="flex" flexDirection="column" p="3" boxShadow="lg" rounded="md" bg="white" {...props} />;
};

const getExerciseTops = (exo: Exercise) => {
    return {
        ...exo,
        createdAt: new Date(exo.createdAt),
        date: displayDate(new Date(exo.createdAt)),
        kgs: {
            min: Math.min(...exo.series.map((set) => set.kg)),
            median: median(exo.series.map((set) => set.kg)),
            max: Math.max(...exo.series.map((set) => set.kg)),
        },
        reps: {
            min: Math.min(...exo.series.map((set) => set.reps)),
            median: median(exo.series.map((set) => set.reps)),
            max: Math.max(...exo.series.map((set) => set.reps)),
        },
    } as ExerciseWithTops;
};

const InspectExerciseHeader = ({ exerciseListWithTops }: { exerciseListWithTops: ExerciseWithTops[] }) => {
    const exercise = useLastExerciseCtx();
    const exerciseList = useDailyExericseListCtx();

    const topKg = Math.max(...exerciseListWithTops.map((exo) => exo.kgs.max));
    const topReps = Math.max(...exerciseListWithTops.map((exo) => exo.reps.max));

    const navigate = useNavigate();

    return (
        <Flex align="center">
            <IconButton
                icon={<ArrowBackIcon />}
                aria-label="Go back"
                mr="4"
                variant="ghost"
                colorScheme="pink"
                fontSize="2xl"
                onClick={(e) => navigate(-1)}
            />
            <Stack direction="row" alignItems="center" w="100%">
                <Stack alignItems="flex-start" w="100%">
                    <Flex alignItems="center">
                        <Text mr="1" fontWeight="bold">
                            {exercise.name}
                        </Text>
                        <Text fontSize="xs">
                            ({exerciseListWithTops.length} / {exerciseList.length})
                        </Text>
                    </Flex>
                    {Boolean(exercise.tags?.length) && <ExerciseTagList tagList={exercise.tags} />}
                </Stack>
            </Stack>
            <Stack ml="auto" mr="2">
                <Tag size="sm" colorScheme="pink" borderRadius="full" variant="subtle" alignSelf="center">
                    {exercise.category}
                </Tag>
                <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                    Top kg {topKg}
                </Badge>
                <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                    Top reps {topReps}
                </Badge>
            </Stack>
        </Flex>
    );
};

const InspectExerciseDateRange = () => {
    const dates = useCalendarValues();
    const rangeContainerRef = useRef();
    const fallbackDates = useConst(getFallbackDates(dates).fallbackDates);

    const exerciseList = useDailyExericseListCtx();
    const oldestExercise = exerciseList[0];

    const ranges = defaultDateRangePresets
        .slice(1)
        // Always include the preset even if its start date is earlier than the oldest exercise
        // (so that the user can see the oldest exercise in case the previous preset doesn't include it)
        .filter((_preset, index, arr) =>
            arr[index - 1] ? getRangeStart(arr[index - 1]) >= oldestExercise?.createdAt : true
        );

    return (
        <VFlex px="4" pos="relative" pt="4" alignItems="center" pb={ranges.length > 1 ? "60px" : "10px"}>
            <Flex alignItems="center" mb="4">
                <CalendarPropsProvider value={{ disablePastDates: oldestExercise?.createdAt }}>
                    <FallbackDatesProvider value={fallbackDates}>
                        <CustomDateRangeCalendarButton
                            calendarRef={rangeContainerRef}
                            renderTrigger={({ onOpen }) => (
                                <Tag colorScheme="pink" variant="solid" onClick={onOpen}>
                                    <TagLabel>
                                        {displayDate(dates.start)} - {displayDate(dates.end)}
                                    </TagLabel>
                                </Tag>
                            )}
                        />
                    </FallbackDatesProvider>
                </CalendarPropsProvider>
            </Flex>
            {ranges.length > 1 && <DateRangePresetPicker rangePresets={ranges} />}
        </VFlex>
    );
};

interface ExerciseWithTops extends Exercise {
    kgs: ExerciseTopValues;
    reps: ExerciseTopValues;
    date: string;
}

interface ExerciseTopValues {
    min: number;
    median: number;
    max: number;
}

const ExerciseWithTopKgAndRepsTableAndCharts = ({
    exerciseListWithTops,
}: {
    exerciseListWithTops: ExerciseWithTops[];
}) => {
    return (
        <Tabs variant="soft-rounded" colorScheme="pink" display="flex" flexDirection="column">
            <ExerciseTopSetsTableInTabs exerciseListWithTops={exerciseListWithTops} />

            <TabList mt="5" alignSelf="center" display="inline-flex" borderRadius="full" bgColor="gray.100">
                <Tab>kgs</Tab>
                <Tab>reps</Tab>
            </TabList>

            <ExerciseTopsLineGraphInTabs exerciseListWithTops={exerciseListWithTops} />
        </Tabs>
    );
};

const ExerciseTopSetsTableInTabs = ({ exerciseListWithTops }: { exerciseListWithTops: ExerciseWithTops[] }) => {
    const ctx = useTabsContext();

    return (
        <Box maxH="170px" overflow="auto">
            <ExerciseTopSetsTable
                exerciseList={exerciseListWithTops}
                tableProps={{
                    size: "xs",
                    hiddenColumns: ctx.selectedIndex === 0 ? ["topReps", "kgWithTopReps"] : ["topKg", "repsWithTopKg"],
                }}
            />
        </Box>
    );
};

const ExerciseTopsLineGraphInTabs = ({
    exerciseListWithTops,
}: Pick<ComponentPropsWithoutRef<typeof ExerciseWithTopKgAndRepsTableAndCharts>, "exerciseListWithTops">) => {
    const ctx = useTabsContext();
    const prefix = ctx.selectedIndex === 0 ? "kgs" : "reps";
    const data = exerciseListWithTops.map((exo) => ({ date: exo.date, ...exo[prefix] }));

    return (
        <Box w="100%" h="200px" my="4">
            <LineGraph data={data}>
                <Line type="monotone" dataKey="min" name="min" stroke="red" />
                <Line type="monotone" dataKey="median" name="median" stroke="#8884d8" />
                <Line type="monotone" dataKey="max" name="max" stroke="#82ca9d" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
            </LineGraph>
        </Box>
    );
};

const LineGraph = ({
    data,
    children,
}: Pick<ComponentPropsWithoutRef<typeof LineChart>, "data"> & PropsWithChildren) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                {children}
            </LineChart>
        </ResponsiveContainer>
    );
};

const PieColorNames = [
    "pink.300",
    "twitter.300",
    "yellow.300",
    "green.300",
    "orange.300",
    "red.300",
    "blue.300",
    "purple.300",
    "gray.300",
];
const ByTagPieGraph = () => {
    const exercise = useLastExerciseCtx();
    const exerciseListInDateRange = useExerciseListInDateRangeCtx();

    const byTags = Object.fromEntries(
        exercise.tags.map((tag) => [tag.id, exerciseListInDateRange.filter((exo) => exo.tags.includes(tag)).length])
    );
    const theme = useTheme();
    const colors = PieColorNames.map((name) => get(theme.colors, name));
    const data = Object.entries(byTags).map(([tagId, count]) => ({
        tagId,
        count,
        name: exercise.tags.find((tag) => tag.id === tagId)?.name,
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                <Pie data={data} dataKey="count" label innerRadius={30}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Legend />
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

const TotalKgVolumeLineGraph = () => {
    const exerciseListInDateRange = useExerciseListInDateRangeCtx();
    const data = exerciseListInDateRange.map((exo) => ({
        date: displayDate(exo.createdAt),
        volume: getSum(exo.series.map((set) => set.kg * set.reps)),
    }));

    return (
        <LineGraph data={data}>
            <Line type="monotone" dataKey="volume" name="daily kg" stroke="#8884d8" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
        </LineGraph>
    );
};

const StatsTable = () => {
    const exerciseListInDateRange = useExerciseListInDateRangeCtx();
    const { setsCount, kgs, reps, volume } = getExerciseListStats(exerciseListInDateRange);

    const data = [
        getStatsWithType("sets", setsCount),
        getStatsWithType("kgs", kgs),
        getStatsWithType("reps", reps),
        getStatsWithType("volume", volume),
    ];

    return <DynamicTable size="xs" columns={statsColumns} data={data} />;
};
const statsColumns = [
    { accessorKey: "type", header: null },
    { accessorKey: "min", header: "Min" },
    // { accessorKey: "average", header: "Average" },
    { accessorKey: "median", header: "Med." },
    { accessorKey: "max", header: "Max" },
    { accessorKey: "sum", header: "Sum" },
];

const getStatsWithType = (type: string, list: number[]) => ({ ...getListStats(list), type });
const getExerciseListStats = (exerciseList: Exercise[]) => {
    const setsCount = exerciseList.map((exo) => exo.series.length);
    const kgs = exerciseList.flatMap((exo) => exo.series.map((set) => set.kg));
    const reps = exerciseList.flatMap((exo) => exo.series.map((set) => set.reps));
    const volume = exerciseList.flatMap((exo) => getSum(exo.series.map((set) => set.kg * set.reps)));

    return { setsCount, kgs, reps, volume };
};

const ProgressSinceDate = ({ renderTitle }: { renderTitle: (since: Date) => ReactNode }) => {
    const { start, end } = useCalendarValues();

    const diffInDays = differenceInDays(end, start);
    const prevStartByDays = subDays(start, diffInDays);
    const range = getInferedDateRangePreset(prevStartByDays, start);
    const prevStart = range.date;

    const exerciseListFromDaily = useDailyExericseListCtx();
    const exerciseListInPrevDateRange = exerciseListFromDaily.filter(
        (exo) => exo.createdAt >= prevStart && exo.createdAt <= start
    );

    return (
        <>
            {renderTitle(prevStart)}
            <Show
                when={Boolean(exerciseListInPrevDateRange.length)}
                fallback={
                    <Alert display="flex" flexDirection="column" my="auto" variant="subtle" status="warning">
                        <AlertIcon />
                        <span>No data between these dates ! 😢</span>
                        <span>
                            First occurence was the{" "}
                            <Text as="span" fontWeight="bold">
                                {displayDate(exerciseListFromDaily[0].createdAt)}
                            </Text>
                        </span>
                    </Alert>
                }
            >
                {Boolean(exerciseListInPrevDateRange.length) && (
                    <Tabs variant="soft-rounded" colorScheme="pink" display="flex" flexDirection="column">
                        <ProgressSinceDateStats exerciseListInPrevDateRange={exerciseListInPrevDateRange} />

                        <TabList
                            mt="1.5"
                            alignSelf="center"
                            display="inline-flex"
                            borderRadius="full"
                            bgColor="gray.100"
                        >
                            <Tab>min</Tab>
                            <Tab>average</Tab>
                            <Tab>median</Tab>
                            <Tab>max</Tab>
                        </TabList>
                    </Tabs>
                )}
            </Show>
        </>
    );
};

const ProgressSinceDateStats = ({ exerciseListInPrevDateRange }: { exerciseListInPrevDateRange: Exercise[] }) => {
    const prevStats = getExerciseListStats(exerciseListInPrevDateRange);

    const exerciseListInDateRange = useExerciseListInDateRangeCtx();
    const stats = getExerciseListStats(exerciseListInDateRange);

    const ctx = useTabsContext();
    const getStat = match(ctx.focusedIndex)
        .with(0, () => (list: number[]) => Math.min(...list))
        .with(1, () => (list: number[]) => roundTo(getSum(list) / list.length, 2))
        .with(2, () => median)
        .with(3, () => (list: number[]) => Math.max(...list))
        .run();

    const diffs = {
        kg: roundTo(getStat(stats.kgs) - getStat(prevStats.kgs)),
        reps: roundTo(getStat(stats.reps) - getStat(prevStats.reps)),
        volume: roundTo(getStat(stats.volume) - getStat(prevStats.volume)),
    };

    return (
        <StatGroup>
            <Stat>
                <StatLabel>Kgs</StatLabel>
                <StatNumber>
                    {match(diffs.kg)
                        .when(
                            (diff) => diff === 0,
                            () => (
                                <Box display="inline-flex">
                                    <StatArrow type="increase" />
                                    <StatArrow type="decrease" />
                                </Box>
                            )
                        )
                        .when(
                            (diff) => diff > 0,
                            () => <StatArrow type="increase" />
                        )
                        .when(
                            (diff) => diff < 0,
                            () => <StatArrow type="decrease" />
                        )
                        .run()}
                    {diffs.kg}
                </StatNumber>
                <StatHelpText display="flex" alignItems="center">
                    {getStat(prevStats.kgs)} <ChevronRightIcon /> {getStat(stats.kgs)}
                </StatHelpText>
            </Stat>

            <Stat>
                <StatLabel>Reps</StatLabel>
                <StatNumber>
                    {match(diffs.reps)
                        .when(
                            (diff) => diff === 0,
                            () => (
                                <Box display="inline-flex">
                                    <StatArrow type="increase" />
                                    <StatArrow type="decrease" />
                                </Box>
                            )
                        )
                        .when(
                            (diff) => diff > 0,
                            () => <StatArrow type="increase" />
                        )
                        .when(
                            (diff) => diff < 0,
                            () => <StatArrow type="decrease" />
                        )
                        .run()}
                    {diffs.reps}
                </StatNumber>
                <StatHelpText display="flex" alignItems="center">
                    {getStat(prevStats.reps)} <ChevronRightIcon /> {getStat(stats.reps)}
                </StatHelpText>
            </Stat>

            <Stat>
                <StatLabel>Volume</StatLabel>
                <StatNumber>
                    {match(diffs.volume)
                        .when(
                            (diff) => diff === 0,
                            () => (
                                <Box display="inline-flex">
                                    <StatArrow type="increase" />
                                    <StatArrow type="decrease" />
                                </Box>
                            )
                        )
                        .when(
                            (diff) => diff > 0,
                            () => <StatArrow type="increase" />
                        )
                        .when(
                            (diff) => diff < 0,
                            () => <StatArrow type="decrease" />
                        )
                        .run()}
                    {diffs.volume}
                </StatNumber>
                <StatHelpText display="flex" alignItems="center">
                    {getStat(prevStats.volume)} <ChevronRightIcon /> {getStat(stats.volume)}
                </StatHelpText>
            </Stat>
        </StatGroup>
    );
};
