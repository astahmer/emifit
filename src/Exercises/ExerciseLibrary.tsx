import { FloatingButton } from "@/components/FloatingButton";
import { MultiSelect } from "@/fields/MultiSelect";
import { SortByDirection, SortByIconButton } from "@/components/SortByIconButton";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { ExerciseCombobox } from "@/Exercises/ExerciseCombobox";
import { useCategoryList, useCategoryQuery, useExerciseList } from "@/orm-hooks";
import { Exercise, Tag } from "@/orm-types";
import { SearchIcon } from "@chakra-ui/icons";
import { Accordion, Box, ButtonGroup, Divider, filter, Flex, IconButton, Portal, Stack, Text } from "@chakra-ui/react";
import { sortBy } from "@pastable/core";
import { useEffect, useRef, useState } from "react";
import { ExerciseLibraryItem } from "./ExerciseLibraryItem";
import { useInterpret, useMachine, useSelector } from "@xstate/react";
import { ExerciseFiltersMachine, ExerciseFiltersProvider, useExerciseFilters } from "./ExerciseFiltersMachine";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { InterpreterFrom } from "xstate";
import { needsAll } from "@/functions/needsAll";

export const ExerciseLibrary = () => {
    // const [state, send, service] = useMachine(ExerciseFiltersMachine);
    const service = useInterpret(ExerciseFiltersMachine);
    const isInitialized = useSelector(service, () => service.initialized);
    // const filters = state.context;
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

    const exerciseListByCategory = useExerciseList({ index: "by-category", query: filters.category });

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
    console.log({ exerciseList });

    return (
        <ExerciseFiltersProvider value={service}>
            {isInitialized && <ExerciseLibraryFilters tagList={tagList} />}
            <Flex flexDirection="column" mt="4" h="100%" minH="0" overflow="auto">
                <Accordion allowToggle w="100%">
                    {/* TODO virtual ? */}
                    {/* {exerciseList.map((exo, index) => (
                        <ExerciseLibraryItem key={exo.id} exercise={exo} index={index} />
                    ))} */}
                </Accordion>
                <Divider my="2" />
            </Flex>
        </ExerciseFiltersProvider>
    );
};

export const ExerciseLibraryFilters = ({ tagList }: { tagList: Tag[] }) => {
    const containerRef = useRef();
    const service = useExerciseFilters();
    const send = service.send;
    const filters = service.state.context;

    if (!filters.category) return null;

    return (
        <>
            <Stack mt="4" w="100%">
                <CategoryRadioPicker
                    defaultValue={filters.category}
                    onChange={(category) => (console.log(category), send({ type: "UpdateCategory", category }))}
                />
                <ButtonGroup isAttached variant="outline">
                    <MultiSelect
                        onChange={(selecteds) =>
                            send({ type: "UpdateTagList", tagList: selecteds.map((tag) => tag.id) })
                        }
                        items={tagList}
                        getValue={(item) => item.id}
                        itemToString={(item) => item.name}
                        renderList={({ ListComponent, ...props }) => (
                            <Portal containerRef={containerRef}>
                                <ListComponent {...props} />
                            </Portal>
                        )}
                        getButtonProps={() => ({ w: "100%" })}
                        renderButtonText={(selection) => (
                            <Text maxW="100%" textOverflow="ellipsis" overflow="hidden">
                                {selection.length
                                    ? `(${selection.length}) ${selection.map((item) => item.name).join(", ")}`
                                    : "Filter by tags"}
                            </Text>
                        )}
                    />
                    <SortByIconButton
                        sortByDirection={filters.sortByDirection}
                        onSortByDirectionChange={(direction) => send({ type: "UpdateSortByDirection", direction })}
                    />
                </ButtonGroup>
                <div ref={containerRef} />
            </Stack>
            <FloatingButton
                renderButton={(props) => (
                    <IconButton
                        aria-label="Search"
                        icon={<SearchIcon />}
                        colorScheme="pink"
                        rounded="full"
                        size="lg"
                        onClick={props.onOpen}
                    />
                )}
                renderModalContent={() => (
                    <Box py="4">
                        <ExerciseCombobox
                            initialSelectedItem={filters.selected}
                            defaultValue={filters.selected?.name}
                            onSelectedItemChange={(changes) =>
                                send({ type: "SelectExercise", exercise: changes.selectedItem })
                            }
                            params={{ index: "by-category", query: filters.category }}
                            getItems={(items) =>
                                items.filter((exo) =>
                                    filters.tagList.every((tagId) => exo.tags.some((t) => t.id === tagId))
                                )
                            }
                            placeholder="Search for an exercise..."
                        />
                    </Box>
                )}
            />
        </>
    );
};
