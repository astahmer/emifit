import { HFlex } from "@/components/HFlex";
import { ExerciseTaskItem } from "@/Exercises/ExerciseTaskItem";
import { ExerciseFiltersMachine, ExerciseFiltersProvider } from "@/Exercises/ExerciseFiltersMachine";
import { ExerciseLibraryFilters } from "@/Exercises/ExerciseLibrary";
import { ExerciseListItem } from "@/Exercises/ExerciseListItem";
import { groupBy } from "@/functions/groupBy";
import { needsAll } from "@/functions/needsAll";
import { useCategoryList, useCategoryQuery, useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { getMostRecentsExerciseById } from "@/orm-utils";
import { Box, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import { sortBy, useSelection } from "@pastable/core";
import { useInterpret, useSelector } from "@xstate/react";
import { Fragment, useEffect } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckboxCircle, CheckboxSquare } from "@/fields/CheckboxCircle";
import { CompactProvider } from "@/store";
import { ChevronRightIcon } from "@chakra-ui/icons";

export const InspectTab = () => {
    const service = useInterpret(ExerciseFiltersMachine);
    const isInitialized = useSelector(service, () => service.initialized);
    const filters = useSelector(service, (state) => state.context);

    const categoryList = useCategoryList();

    // auto-select 1st category  so that there is always one selected
    useEffect(() => {
        if (!filters.category && categoryList.length) {
            service.send({ type: "UpdateCategory", category: categoryList[0].id });
        }
    }, [categoryList, filters.category, service.send]);

    const tagQuery = useCategoryQuery(filters.category);
    const tagList = tagQuery.data?.tagList || [];

    const exerciseListByCategoryQuery = useExerciseUnsortedList({ index: "by-category", query: filters.category });
    const exerciseListByCategory = getMostRecentsExerciseById(exerciseListByCategoryQuery.data || []);
    const groupedByNames = groupBy(exerciseListByCategoryQuery.data || [], "name");

    const byTag = (exo: Exercise) => filters.tagList.every((tagId) => exo.tags.some((t) => t.id === tagId));
    const byName = (exo: Exercise) => exo.name.toLowerCase() === filters.selected?.name.toLowerCase();
    const filtersToApply = [filters.tagList.length ? byTag : undefined, filters.selected ? byName : undefined].filter(
        Boolean
    );

    let exerciseList = filtersToApply.length
        ? exerciseListByCategory.filter(needsAll(...filtersToApply))
        : exerciseListByCategory;

    if (filters.sortByDirection) {
        exerciseList = sortBy(exerciseList, "name", filters.sortByDirection);
    }

    return (
        <>
            <ExerciseFiltersProvider value={service}>
                {isInitialized && <ExerciseLibraryFilters tagList={tagList} />}
            </ExerciseFiltersProvider>
            <Flex flexDirection="column" pt="2" overflowY="auto">
                {exerciseList.map((exo, index) => (
                    <Fragment key={exo.id}>
                        {index > 0 && (
                            <Box px="4">
                                <Divider my="1" />
                            </Box>
                        )}
                        <Box py="1" px="4" d="flex">
                            <ExerciseListItem
                                exo={{
                                    ...exo,
                                    // hijacking the name prop (which should only be a string) to customize the render
                                    // @ts-ignore
                                    name: (
                                        <Flex alignItems="center">
                                            <Text fontSize="md">{exo.name}</Text>
                                            <Text ml="1" fontSize="xs">
                                                ({groupedByNames[exo.name].length})
                                            </Text>
                                        </Flex>
                                    ),
                                }}
                                shouldShowAllTags
                            />
                            <Flex h="100%" alignItems="center" pr="4">
                                <ChevronRightIcon />
                            </Flex>
                        </Box>
                    </Fragment>
                ))}
            </Flex>
            {/* <Box w="100%" h="300px" my="4">
                <LineGraph />
            </Box> */}
        </>
    );
};

const data = [
    { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
    { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
    { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
    { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
    { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
    { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
    { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

const LineGraph = () => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
};
