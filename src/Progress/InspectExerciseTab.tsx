import { ExerciseName } from "@/Exercises/ExerciseName";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { ExerciseTopSetsTable } from "@/Exercises/ExerciseTopSetsTable";
import { displayDate } from "@/functions/utils";
import { useExerciseUnsortedList } from "@/orm-hooks";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
    Badge,
    Box,
    Divider,
    Flex,
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
import { getSum, roundTo, sortBy } from "@pastable/core";
import { ComponentPropsWithoutRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const InspectExerciseTab = () => {
    const { exoSlug } = useParams();
    const query = useExerciseUnsortedList({ index: "by-slug", query: exoSlug });
    const exerciseList = (query.data || []).filter((exo) => exo.from === "daily");

    const listWithComputeds = exerciseList.map((exo) => ({
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
    }));
    const data = sortBy(listWithComputeds, "createdAt");
    const exercise = data.at(-1);

    const topKg = Math.max(...data.map((exo) => exo.kgs.top));
    const topReps = Math.max(...data.map((exo) => exo.reps.top));

    const navigate = useNavigate();

    return (
        <Box pos="relative" h="100%" minH={0}>
            <Box h="100%" minH={0} overflowX="hidden" overflowY="auto" p="4">
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
                <Divider my="4" />
                <ExerciseTopSetsTable exerciseList={exerciseList} />
                <Tabs>
                    <TabList>
                        <Tab>kgs</Tab>
                        <Tab>reps</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <Box w="100%" h="250px" my="4">
                                <LineGraph data={data} prefix="kgs" />
                            </Box>
                        </TabPanel>
                        <TabPanel>
                            <Box w="100%" h="250px" my="4">
                                <LineGraph data={data} prefix="reps" />
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

const LineGraph = ({ data, prefix }: Pick<ComponentPropsWithoutRef<typeof LineChart>, "data"> & { prefix: string }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, bottom: 5 }}>
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
