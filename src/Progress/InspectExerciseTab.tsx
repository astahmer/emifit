import { baseRangePresets, DateRangePresetPicker, getRangeStart } from "@/Calendar/DateRangePresetPicker";
import { CalendarValuesProvider } from "@/Calendar/useCalendarValues";
import { AppExternalLinkIcon } from "@/components/AppExternalLinkIcon";
import { Show } from "@/components/Show";
import { VFlex } from "@/components/VFlex";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { ExerciseTopSetsTable } from "@/Exercises/ExerciseTopSetsTable";
import { displayDate } from "@/functions/utils";
import { useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise, WithExerciseList } from "@/orm-types";
import { ArrowBackIcon, TriangleDownIcon } from "@chakra-ui/icons";
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
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useTabsContext,
    useTheme,
} from "@chakra-ui/react";
import { CalendarValues } from "@uselessdev/datepicker";
import { get, getSum, groupBy, roundTo, sortBy, uniques } from "pastable";
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
                        gridAutoRows="minmax(150px, 1fr)"
                        gridTemplateColumns="1fr 1fr"
                    >
                        <Card colSpan={2} rowSpan={3}>
                            <Text fontSize="md" fontWeight="bold">
                                Top kg/reps
                            </Text>
                            <Box my="auto">
                                <ExerciseWithTopKgAndRepsTableAndCharts exerciseListWithTops={exerciseListWithTops} />
                            </Box>
                        </Card>
                        {/* TODO radial graph */}
                        <Card colSpan={2} rowSpan={2}>
                            <Text fontSize="md" fontWeight="bold" whiteSpace="nowrap">
                                Usage by tag
                            </Text>
                            <ByTagPieGraph exerciseList={exerciseList} />
                        </Card>
                        <Card colSpan={1}>
                            <Text fontSize="md" fontWeight="bold">
                                Totals
                            </Text>
                        </Card>
                        {/* TODO +x kgs / -y reps, en mode <Stats> */}
                        <Card colSpan={2}>
                            <Text fontSize="md" fontWeight="bold">
                                Progress avec last week/last month
                            </Text>
                        </Card>
                        {/* graph Total volume (kg) by day en graphiques avec des points reliés ou courbe remplie */}
                        <Card colSpan={1}>
                            <Text fontSize="md" fontWeight="bold">
                                Total volume (kg)
                            </Text>
                        </Card>
                        {/* TODO History page:
                        vue comme Google Agenda où on a une liste avec :
                        1 ligne (ou card) = 1 jour et on voit la catégorie + le nom des exos, liste scrollable */}
                        <Card rowSpan={2}>
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
                        {/* TODO podium ? */}
                        <Card colSpan={2}>
                            <Text fontSize="md" fontWeight="bold">
                                Records
                            </Text>
                        </Card>
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

            <LineGraphInTabs exerciseListWithTops={exerciseListWithTops} />
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

const LineGraphInTabs = ({
    exerciseListWithTops,
}: Pick<ComponentPropsWithoutRef<typeof ExerciseWithTopKgAndRepsTableAndCharts>, "exerciseListWithTops">) => {
    const ctx = useTabsContext();

    return (
        <Box w="100%" h="200px" my="4">
            <LineGraph data={exerciseListWithTops} prefix={ctx.selectedIndex ? "kgs" : "reps"}>
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
    prefix,
    children,
}: Pick<ComponentPropsWithoutRef<typeof LineChart>, "data"> & { prefix: string } & PropsWithChildren) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey={prefix + ".bot"} name="lowest" stroke="red" />
                <Line type="monotone" dataKey={prefix + ".medium"} name="average" stroke="#8884d8" />
                <Line type="monotone" dataKey={prefix + ".top"} name="best" stroke="#82ca9d" />
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
