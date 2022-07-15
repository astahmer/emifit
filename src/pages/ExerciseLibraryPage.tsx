import { DynamicTable } from "@/components/DynamicTable";
import { FloatingButton } from "@/components/FloatingButton";
import { MultiSelect } from "@/fields/MultiSelect";
import { Show } from "@/components/Show";
import { SortByDirection, SortByIconButton } from "@/components/SortByIconButton";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { ExerciseCombobox } from "@/Exercises/ExerciseCombobox";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { useCategoryList, useCategoryQuery, useExerciseList, useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { ExternalLinkIcon, SearchIcon } from "@chakra-ui/icons";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    ButtonGroup,
    Divider,
    Flex,
    Heading,
    IconButton,
    Portal,
    Stack,
    Text,
    useAccordionContext,
} from "@chakra-ui/react";
import { findBy, sortBy } from "@pastable/core";
import { useEffect, useRef, useState } from "react";
import { Link as ReactLink } from "react-router-dom";
import { Row } from "react-table";

export const ExerciseLibraryPage = () => {
    const categoryList = useCategoryList();
    const [byCategory, setByCategory] = useState<string>();

    // auto-select 1st category  so that there is always one selected
    useEffect(() => {
        if (!byCategory && categoryList.length) {
            setByCategory(categoryList[0].id);
        }
    }, [categoryList, byCategory]);

    const tagQuery = useCategoryQuery(byCategory);
    const tagList = tagQuery.data?.tagList || [];
    const [byTags, setByTags] = useState<string[]>([]);
    const [byName, setByName] = useState<Exercise>();

    const exerciseListByCategory = useExerciseList({ index: "by-category", query: byCategory });
    let exerciseList = exerciseListByCategory;

    if (byTags.length) {
        exerciseList = exerciseList.filter((exo) => byTags.every((tagId) => exo.tags.some((t) => t.id === tagId)));
    }
    if (byName) {
        exerciseList = exerciseList.filter((exo) => exo.name.toLowerCase() === byName?.name.toLowerCase());
    }

    const containerRef = useRef();
    const [sortByDirection, setSortByDirection] = useState<SortByDirection>("asc");

    if (sortByDirection) {
        exerciseList = sortBy(exerciseList, "name", sortByDirection);
    }

    return (
        <Box id="ExerciseLibraryPage" d="flex" flexDirection="column" h="100%" p="4" w="100%" pos="relative">
            <Heading as="h1">Exercise Library</Heading>
            {byCategory && (
                <Stack mt="4" w="100%">
                    <CategoryRadioPicker defaultValue={byCategory} onChange={setByCategory} />
                    <ButtonGroup isAttached variant="outline">
                        <MultiSelect
                            onChange={(selecteds) => setByTags(selecteds.map((tag) => tag.id))}
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
                            sortByDirection={sortByDirection}
                            onSortByDirectionChange={setSortByDirection}
                        />
                    </ButtonGroup>
                    <div ref={containerRef} />
                </Stack>
            )}
            <Flex flexDirection="column" mt="4" h="100%" minH="0" overflow="auto">
                <Accordion allowToggle w="100%">
                    {/* TODO virtual */}
                    {exerciseList.map((exo, index) => (
                        <ExerciseLibraryItem key={exo.id} exercise={exo} index={index} />
                    ))}
                </Accordion>
                <Divider my="2" />
            </Flex>
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
                            initialSelectedItem={byName}
                            defaultValue={byName?.name}
                            onSelectedItemChange={(changes) => setByName(changes.selectedItem || null)}
                            params={{ index: "by-category", query: byCategory }}
                            getItems={(items) =>
                                items.filter((exo) => byTags.every((tagId) => exo.tags.some((t) => t.id === tagId)))
                            }
                            placeholder="Search for an exercise..."
                        />
                    </Box>
                )}
            />
        </Box>
    );
};

const ExerciseLibraryItem = ({ exercise, index }: { exercise: Exercise; index: number }) => {
    const query = useExerciseUnsortedList({ index: "by-name", query: exercise.name });
    const exerciseList = (query.data || []).filter((exo) => exo.from === "daily");
    const ctx = useAccordionContext();

    const listWithTops = exerciseList.map((exo) => ({
        ...exo,
        createdAt: new Date(exo.createdAt),
        topKg: Math.max(...exo.series.map((set) => set.kg)),
        topReps: Math.max(...exo.series.map((set) => set.reps)),
    }));

    const topKg = Math.max(...listWithTops.map((exo) => exo.topKg));
    const topReps = Math.max(...listWithTops.map((exo) => exo.topReps));

    const data = listWithTops.map((exo) => ({
        ...exo,
        isTopKg: exo.topKg === topKg,
        isTopReps: exo.topReps === topReps,
    }));

    return (
        <AccordionItem w="100%" isDisabled={!exerciseList.length}>
            <AccordionButton w="100%">
                <Stack direction="row" alignItems="center" w="100%">
                    <Stack alignItems="flex-start" w="100%">
                        <Flex alignItems="flex-start">
                            <Text mr="1">{exercise.name}</Text>
                            <Text fontSize="xs">({exerciseList.length})</Text>
                        </Flex>
                        {Boolean(exercise.tags?.length) && <ExerciseTagList tagList={exercise.tags} />}
                    </Stack>
                </Stack>
                <Show when={ctx.index === index}>
                    <Stack mx="2">
                        <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                            Top kg {topKg}
                        </Badge>
                        <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                            Top reps {topReps}
                        </Badge>
                    </Stack>
                </Show>
                {Boolean(exerciseList.length) && <AccordionIcon ml="auto" />}
            </AccordionButton>
            <AccordionPanel
                pb={4}
                borderWidth="1px"
                borderColor="pink.100"
                borderRadius="md"
                borderTopLeftRadius={0}
                borderTopRightRadius={0}
                sx={{ th: { whiteSpace: "nowrap" } }}
            >
                <DynamicTable
                    columns={columns}
                    data={data}
                    isHeaderSticky
                    initialSortBy={[{ id: "createdAt", desc: true }]}
                />
            </AccordionPanel>
        </AccordionItem>
    );
};

const columns = [
    {
        Header: "Date",
        accessor: "createdAt",
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
                    {new Date(props.value).toLocaleDateString()}
                </Text>
            </Stack>
        ),
    },
    {
        Header: "top kg",
        accessor: "topKg",
        Cell: (props) => {
            const exo = props.row.original as ExerciseWithTops;
            const list = props.sortedRows as Row<ExerciseWithTops>[];

            const sortedIndex = findBy(list, "original.id", exo.id, true);
            const next = list[sortedIndex + 1];
            const diff = sortedIndex < list.length - 1 ? exo.topKg - next?.original.topKg : 0;

            return (
                <Stack direction="row" alignItems="center">
                    <Text {...(exo.isTopKg ? { color: "pink.300", fontWeight: "bold" } : undefined)}>
                        {props.value}
                    </Text>
                    <Show when={diff !== 0}>
                        <Badge
                            variant="subtle"
                            colorScheme={diff > 0 ? "whatsapp" : "red"}
                            fontSize="x-small"
                            fontStyle="italic"
                        >
                            {diff > 0 ? "+" + diff : diff}
                        </Badge>
                    </Show>
                </Stack>
            );
        },
    },
    {
        Header: "top reps",
        accessor: "topReps",
        Cell: (props) => {
            const exo = props.row.original as ExerciseWithTops;
            const list = props.sortedRows as Row<ExerciseWithTops>[];

            const sortedIndex = findBy(list, "original.id", exo.id, true);
            const next = list[sortedIndex + 1];
            const diff = sortedIndex < list.length - 1 ? exo.topReps - next?.original.topReps : 0;

            return (
                <Stack direction="row" alignItems="center">
                    <Text {...(exo.isTopReps ? { color: "pink.300", fontWeight: "bold" } : undefined)}>
                        {props.value}
                    </Text>
                    <Show when={diff !== 0}>
                        <Badge
                            variant="subtle"
                            colorScheme={diff > 0 ? "whatsapp" : "red"}
                            fontSize="x-small"
                            fontStyle="italic"
                        >
                            {diff > 0 ? "+" + diff : diff}
                        </Badge>
                    </Show>
                </Stack>
            );
        },
    },
];

interface ExerciseWithTops extends Exercise {
    isTopKg: boolean;
    isTopReps: boolean;
    topKg: number;
    topReps: number;
}
