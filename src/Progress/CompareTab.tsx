import { ExerciseFiltersMachine, ExerciseFiltersProvider } from "@/Exercises/ExerciseFiltersMachine";
import { ExerciseLibraryFilters } from "@/Exercises/ExerciseLibrary";
import { ExerciseListItem } from "@/Exercises/ExerciseListItem";
import { CheckboxSquare } from "@/fields/CheckboxCircle";
import { groupBy } from "@/functions/groupBy";
import { needsAll } from "@/functions/needsAll";
import { useCategoryList, useCategoryQuery, useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { getMostRecentsExerciseById } from "@/orm-utils";
import { Box, Flex } from "@chakra-ui/react";
import { sortBy, useSelection } from "@pastable/core";
import { useInterpret, useSelector } from "@xstate/react";
import { useEffect } from "react";

export const CompareTab = () => {
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

    const [selecteds, selection] = useSelection({ getId: (exo: Exercise) => exo.id });
    console.log(selecteds);

    return (
        <>
            <ExerciseFiltersProvider value={service}>
                {isInitialized && <ExerciseLibraryFilters tagList={tagList} />}
            </ExerciseFiltersProvider>
            <Flex flexDirection="column" pt="2" overflowY="auto">
                {exerciseList.map((exo) => (
                    <Box
                        key={exo.id}
                        py="1"
                        px="4"
                        d="flex"
                        onClickCapture={(e) => (e.preventDefault(), selection.toggle(exo))}
                    >
                        <Flex h="100%" alignItems="center" pr="4">
                            <CheckboxSquare
                                getIconProps={() => ({ size: "sm" })}
                                onChange={(e) => (e.stopPropagation(), selection.toggle(exo))}
                                isChecked={selection.has(exo)}
                            />
                        </Flex>
                        <ExerciseListItem exo={exo} shouldShowAllTags />
                    </Box>
                ))}
            </Flex>
        </>
    );
};
