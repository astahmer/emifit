import { ExerciseFiltersMachine, ExerciseFiltersProvider } from "@/Exercises/ExerciseFiltersMachine";
import { ExerciseLibraryFilters } from "@/Exercises/ExerciseLibrary";
import { ExerciseListItem } from "@/Exercises/ExerciseListItem";
import { groupBy } from "@/functions/groupBy";
import { needsAll } from "@/functions/needsAll";
import { useCategoryList, useCategoryQuery, useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { getMostRecentsExerciseById } from "@/orm-utils";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Divider, Flex, Text } from "@chakra-ui/react";
import { sortBy } from "pastable";
import { useInterpret, useSelector } from "@xstate/react";
import { Fragment, useEffect } from "react";
import { Link as ReactLink } from "react-router-dom";

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
    const groupedByNames = groupBy(
        (exerciseListByCategoryQuery.data || []).filter((exo) => exo.from === "daily"),
        "name"
    );

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
                        <Flex as={ReactLink} to={exo.slug} py="1" px="4" alignItems="center">
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
                        </Flex>
                    </Fragment>
                ))}
            </Flex>
        </>
    );
};
