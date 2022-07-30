import { baseRangePresets, DateRangePresetPicker, getRangeStart } from "@/Calendar/DateRangePresetPicker";
import { CalendarValuesProvider } from "@/Calendar/useCalendarValues";
import { DynamicTable } from "@/components/DynamicTable";
import { Show } from "@/components/Show";
import { VFlex } from "@/components/VFlex";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { ExerciseTopSetsTable } from "@/Exercises/ExerciseTopSetsTable";
import { displayDate } from "@/functions/utils";
import { useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise, WithExerciseList } from "@/orm-types";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
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
    Tab,
    TabList,
    Tabs,
    Tag,
    Text,
    useTabsContext,
    useTheme,
} from "@chakra-ui/react";
import { CalendarValues } from "@uselessdev/datepicker";
import { get, getSum, roundTo, sortBy } from "pastable";
import { ComponentPropsWithoutRef, PropsWithChildren, useState } from "react";
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
import { CenteredSpinner } from "./CenteredSpinner";

export const InspectExerciseTab = () => {
    const { exoSlug } = useParams();
    const query = useExerciseUnsortedList({ index: "by-slug", query: exoSlug });

    const [dates, setDates] = useState<CalendarValues>({ start: getRangeStart("1y"), end: new Date() });
    const exerciseList = sortBy(
        (query.data || []).filter(
            (exo) => exo.from === "daily" && exo.createdAt >= dates.start && exo.createdAt <= dates.end
        ),
        "createdAt"
    );

    const exerciseListWithTops = exerciseList.map(getExerciseTops);

    return (
        <VFlex pos="relative" h="100%" minH={0} pt="4">
            <Show when={Boolean(exerciseList.length)} fallback={<CenteredSpinner h="100%" />}>
                <VFlex px="4">
                    <Header exerciseListWithTops={exerciseListWithTops} />
                    <Divider my="4" />
                </VFlex>
                <VFlex h="100%" minH={0}>
                    <VFlex px="4">
                        {/* TODO Dropdown avec les presets quand on clique plutôt que tout dispo via Flex ? */}
                        <CalendarValuesProvider value={{ ...dates, setDates }}>
                            <VFlex bgColor="white" pb="4" px="4">
                                <Flex alignItems="center" mb="4">
                                    <Heading as="h3" fontSize="sm" whiteSpace="nowrap">
                                        From {displayDate(dates.start)} to {displayDate(dates.end)}{" "}
                                    </Heading>
                                </Flex>
                                <DateRangePresetPicker rangePresets={baseRangePresets.slice(1)} />
                            </VFlex>
                        </CalendarValuesProvider>
                        <Divider mt="2" />
                    </VFlex>
                    <Grid
                        h="100%"
                        minH={0}
                        overflowX="hidden"
                        overflowY="auto"
                        bg="gray.100"
                        gap="6"
                        p="4"
                        rounded="lg"
                        gridAutoRows="minmax(80px, 1fr)"
                        gridTemplateColumns="1fr 1fr"
                    >
                        <Card colSpan={2} rowSpan={5}>
                            <Text fontSize="md" fontWeight="bold" mb="1">
                                Top kg/reps
                            </Text>
                            <Box my="auto">
                                <ExerciseWithTopKgAndRepsTableAndCharts exerciseListWithTops={exerciseListWithTops} />
                            </Box>
                        </Card>
                        <Card colSpan={2} rowSpan={4}>
                            <Text fontSize="md" fontWeight="bold" whiteSpace="nowrap">
                                Usage by tag
                            </Text>
                            <ByTagPieGraph exerciseList={exerciseList} />
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
                                <TotalKgVolumeLineGraph exerciseList={exerciseList} />
                            </Box>
                        </Card>
                        <Card colSpan={2} rowSpan={2}>
                            <Text fontSize="md" fontWeight="bold">
                                Summary
                            </Text>
                            <Box w="100%" h="100%" mt="2" maxH="100%" overflow="auto">
                                <SummaryTable exerciseList={exerciseList} />
                            </Box>
                        </Card>
                        {/* TODO +x kgs / -y reps, en mode <Stats> */}
                        {/* Le même à faire dans Progress (pas spécifique à un exo mais tous) */}
                        <Card colSpan={2}>
                            <Text fontSize="md" fontWeight="bold">
                                Progress avec last week/last month
                            </Text>
                        </Card>
                        {/* TODO History page:
                        vue comme Google Agenda où on a une liste avec :
                        1 ligne (ou card) = 1 jour et on voit la catégorie + le nom des exos, liste scrollable */}
                        <Card rowSpan={4}>
                            <Text fontSize="md" fontWeight="bold">
                                History
                            </Text>
                        </Card>
                        {/*  */}
                        <Card colSpan={1}>
                            <Text fontSize="md" fontWeight="bold">
                                Used in programs
                            </Text>
                        </Card>
                        {/* TODO
                        Tableau de totaux, avec comme colonnes:
                        • Nom | Somme | Min | Max | Moyenne | Tendance (+ ou - ou =)
                        et en lignes: Set | Poids | Reps
                        */}
                    </Grid>
                </VFlex>
            </Show>
        </VFlex>
    );
};

const Card = (props: GridItemProps) => {
    return <GridItem display="flex" flexDirection="column" p="3" boxShadow="lg" rounded="md" bg="white" {...props} />;
};

const getExerciseTops = (exo: Exercise) =>
    ({
        ...exo,
        createdAt: new Date(exo.createdAt),
        date: displayDate(new Date(exo.createdAt)),
        kgs: {
            bot: Math.min(...exo.series.map((set) => set.kg)),
            medium: roundTo(getSum(exo.series.map((set) => set.kg)) / exo.series.length, 2),
            top: Math.max(...exo.series.map((set) => set.kg)),
        },
        reps: {
            bot: Math.min(...exo.series.map((set) => set.reps)),
            medium: roundTo(getSum(exo.series.map((set) => set.reps)) / exo.series.length, 2),
            top: Math.max(...exo.series.map((set) => set.reps)),
        },
    } as ExerciseWithTops);

const Header = ({ exerciseListWithTops }: { exerciseListWithTops: ExerciseWithTops[] }) => {
    const exercise = exerciseListWithTops.at(-1);

    const topKg = Math.max(...exerciseListWithTops.map((exo) => exo.kgs.top));
    const topReps = Math.max(...exerciseListWithTops.map((exo) => exo.reps.top));

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
                            {exercise?.name}
                        </Text>
                        <Text fontSize="xs">({exerciseListWithTops.length})</Text>
                    </Flex>
                    {Boolean(exercise?.tags?.length) && <ExerciseTagList tagList={exercise.tags} />}
                </Stack>
            </Stack>
            <Stack ml="auto" mr="2">
                <Tag size="sm" colorScheme="pink" borderRadius="full" variant="subtle" alignSelf="center">
                    {exercise?.category}
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

interface ExerciseWithTops extends Exercise {
    kgs: ExerciseTopValues;
    reps: ExerciseTopValues;
    date: string;
}

interface ExerciseTopValues {
    bot: number;
    medium: number;
    top: number;
}

const ExerciseWithTopKgAndRepsTableAndCharts = ({
    exerciseListWithTops,
}: {
    exerciseListWithTops: ExerciseWithTops[];
}) => {
    return (
        <Tabs variant="soft-rounded" colorScheme="pink" display="flex" flexDirection="column">
            <ExerciseTopSetsTableInTabs exerciseList={exerciseListWithTops} />

            <TabList mt="5" alignSelf="center" display="inline-flex" borderRadius="full" bgColor="gray.100">
                <Tab>kgs</Tab>
                <Tab>reps</Tab>
            </TabList>

            <ExerciseTopsLineGraphInTabs exerciseListWithTops={exerciseListWithTops} />
        </Tabs>
    );
};

const ExerciseTopSetsTableInTabs = ({ exerciseList }: WithExerciseList) => {
    const ctx = useTabsContext();

    return (
        <Box maxH="170px" overflow="auto">
            <ExerciseTopSetsTable
                exerciseList={exerciseList}
                tableProps={{
                    size: "xs",
                    hiddenColumns: ctx.selectedIndex === 0 ? ["topReps", "kgWithTopReps"] : ["topKg", "repsWithTopKg"],
                    // isHeaderSticky: false,
                }}
            />
        </Box>
    );
};

const ExerciseTopsLineGraphInTabs = ({
    exerciseListWithTops,
}: Pick<ComponentPropsWithoutRef<typeof ExerciseWithTopKgAndRepsTableAndCharts>, "exerciseListWithTops">) => {
    const ctx = useTabsContext();
    const prefix = ctx.selectedIndex ? "kgs" : "reps";
    const data = exerciseListWithTops.map((exo) => ({ date: exo.date, ...exo[prefix] }));

    return (
        <Box w="100%" h="200px" my="4">
            <LineGraph data={data}>
                <Line type="monotone" dataKey="bot" name="lowest" stroke="red" />
                <Line type="monotone" dataKey="medium" name="average" stroke="#8884d8" />
                <Line type="monotone" dataKey="top" name="best" stroke="#82ca9d" />
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
            <LineChart data={data}>
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
const ByTagPieGraph = ({ exerciseList }: { exerciseList: Exercise[] }) => {
    const exercise = exerciseList.at(-1);
    const byTags = Object.fromEntries(
        exercise.tags.map((tag) => [tag.id, exerciseList.filter((exo) => exo.tags.includes(tag)).length])
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
            <PieChart margin={{ top: 10 }}>
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

const TotalKgVolumeLineGraph = ({ exerciseList }: WithExerciseList) => {
    const data = exerciseList.map((exo) => ({
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

const SummaryTable = ({ exerciseList }: WithExerciseList) => {
    const setsCount = exerciseList.map((exo) => exo.series.length);
    const kgsCount = exerciseList.flatMap((exo) => exo.series.map((set) => set.kg));
    const repsCount = exerciseList.flatMap((exo) => exo.series.map((set) => set.reps));
    const data = [getStats("sets", setsCount), getStats("kgs", kgsCount), getStats("reps", repsCount)];

    return <DynamicTable size="xs" columns={summaryColumns} data={data} />;
};
const summaryColumns = [
    { accessorKey: "type", header: null },
    { accessorKey: "min", header: "Min" },
    { accessorKey: "average", header: "Average" },
    // { accessorKey: "median", header: "Med." },
    { accessorKey: "max", header: "Max" },
    { accessorKey: "sum", header: "Sum" },
];

const getStats = (type: string, list: number[]) => ({ ...getMinAverageMaxSum(list), type });
const getMinAverageMaxSum = (list: number[]) => {
    return {
        min: Math.min(...list),
        average: roundTo(getSum(list) / list.length, 2),
        median: list[Math.floor(list.length / 2)],
        max: Math.max(...list),
        sum: getSum(list),
    };
};
