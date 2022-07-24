import { baseRangePresets, DateRangePresetPicker, getRangeStart } from "@/Calendar/DateRangePresetPicker";
import { CalendarValuesProvider } from "@/Calendar/useCalendarValues";
import { Show } from "@/components/Show";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { ExerciseTopSetsTable } from "@/Exercises/ExerciseTopSetsTable";
import { displayDate } from "@/functions/utils";
import { useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
    Badge,
    Box,
    Divider,
    Flex,
    Heading,
    IconButton,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Text,
} from "@chakra-ui/react";
import { getSum, roundTo, sortBy } from "pastable";
import { CalendarValues } from "@uselessdev/datepicker";
import { ComponentPropsWithoutRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CenteredSpinner } from "./CenteredSpinner";
import { VFlex } from "@/components/VFlex";

export const InspectExerciseTab = () => {
    const { exoSlug } = useParams();
    const query = useExerciseUnsortedList({ index: "by-slug", query: exoSlug });

    const [dates, setDates] = useState<CalendarValues>({ start: getRangeStart("1y"), end: new Date() });
    const exerciseList = (query.data || []).filter(
        (exo) => exo.from === "daily" && exo.createdAt >= dates.start && exo.createdAt <= dates.end
    );

    const listWithComputeds = exerciseList.map(getExerciseTops);
    const data = sortBy(listWithComputeds, "createdAt");

    return (
        <VFlex pos="relative" h="100%" minH={0} p="4">
            <Header exerciseList={exerciseList} data={data} />
            <Divider my="4" />
            <Show when={Boolean(exerciseList.length)} fallback={<CenteredSpinner h="100%" />}>
                <VFlex h="100%" minH={0} overflowX="hidden" overflowY="auto">
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
                    <Divider my="2" />
                    <Tabs variant="soft-rounded" colorScheme="pink" display="flex" flexDirection="column">
                        <TabPanels>
                            <TabPanel p="0">
                                <ExerciseTopSetsTable
                                    exerciseList={exerciseList}
                                    hiddenColumns={["topReps", "kgWithTopReps"]}
                                />
                            </TabPanel>
                            <TabPanel p="0">
                                <ExerciseTopSetsTable
                                    exerciseList={exerciseList}
                                    hiddenColumns={["topKg", "repsWithTopKg"]}
                                />
                            </TabPanel>
                        </TabPanels>

                        <TabList mt="5" alignSelf="center" display="inline-flex" borderRadius="full" bgColor="gray.100">
                            <Tab>kgs</Tab>
                            <Tab>reps</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel py="0" w="100%" h="250px" my="4">
                                <LineGraph data={data} prefix="kgs" />
                            </TabPanel>
                            <TabPanel py="0" w="100%" h="250px" my="4">
                                <LineGraph data={data} prefix="reps" />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VFlex>
            </Show>
        </VFlex>
    );
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

const Header = ({ exerciseList, data }: { exerciseList: Exercise[]; data: ExerciseWithTops[] }) => {
    const exercise = data.at(-1);

    const topKg = Math.max(...data.map((exo) => exo.kgs.top));
    const topReps = Math.max(...data.map((exo) => exo.reps.top));

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
                        <Text fontSize="xs">({exerciseList.length})</Text>
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

const LineGraph = ({ data, prefix }: Pick<ComponentPropsWithoutRef<typeof LineChart>, "data"> & { prefix: string }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={prefix + ".bot"} name="lowest" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey={prefix + ".medium"} name="average" stroke="#82ca9d" />
                <Line type="monotone" dataKey={prefix + ".top"} name="best" stroke="red" />
            </LineChart>
        </ResponsiveContainer>
    );
};
