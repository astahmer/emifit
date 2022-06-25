import { DynamicTable } from "@/components/DynamicTable";
import { MultiSelect } from "@/components/MultiSelect";
import { Show } from "@/components/Show";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { ExerciseCombobox } from "@/Exercises/ExerciseCombobox";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { useCategoryList, useCategoryQuery, useExerciseList, useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { printDailyDate } from "@/orm-utils";
import { SearchIcon } from "@chakra-ui/icons";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Box,
    Divider,
    Flex,
    Heading,
    IconButton,
    Stack,
    Text,
    useAccordionContext,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as ReactLink } from "react-router-dom";
import { FloatingButton } from "@/components/FloatingButton";

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
    const [byName, setByName] = useState<string>();

    const exerciseListByCategory = useExerciseList({ index: "by-category", query: byCategory });
    let exerciseList = exerciseListByCategory;

    if (byTags.length) {
        exerciseList = exerciseListByCategory.filter((exo) =>
            byTags.every((tagId) => exo.tags.some((t) => t.id === tagId))
        );
    }
    if (byName) {
        exerciseList = exerciseList.filter((exo) => exo.name.toLowerCase() === byName.toLowerCase());
    }

    return (
        <Box id="ExerciseLibraryPage" d="flex" flexDirection="column" h="100%" p="4" w="100%" pos="relative">
            <Heading as="h1">Exercise Library</Heading>
            {byCategory && (
                <Stack mt="4" w="100%">
                    <CategoryRadioPicker defaultValue={byCategory} onChange={setByCategory} />
                    <MultiSelect
                        onChange={(selecteds) => setByTags(selecteds.map((tag) => tag.id))}
                        items={tagList}
                        getValue={(item) => item.id}
                        itemToString={(item) => item.name}
                        renderButtonText={(selection) => (
                            <Text maxW="100%" textOverflow="ellipsis" overflow="hidden">
                                {selection.length
                                    ? `(${selection.length}) ${selection.map((item) => item.name).join(", ")}`
                                    : "Filter by tags"}
                            </Text>
                        )}
                    />
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
                            onSelectedItemChange={(changes) => setByName(changes.selectedItem?.name || null)}
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
    const exerciseList = (query.data || []).filter((exo) => !Boolean(exo.programId));
    const ctx = useAccordionContext();

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
                            Top kg {Math.max(...exercise.series.map((set) => set.kg))}
                        </Badge>
                        <Badge variant="outline" colorScheme="pink" fontSize="x-small">
                            Top reps {Math.max(...exercise.series.map((set) => set.reps))}
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
                    data={exerciseList}
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
        Cell: (props) => (
            <ReactLink to={`/daily/entry/${printDailyDate(new Date(props.value))}`}>
                <Text color="pink.300" fontWeight="bold">
                    {new Date(props.value).toLocaleDateString()}
                </Text>
            </ReactLink>
        ),
    },
    {
        Header: "top kg",
        accessor: "series.kg",
        // TODO tag si best
        Cell: (props) => (
            <Text>{(props.row.original as Exercise).series.reduce((max, serie) => Math.max(max, serie.kg), 0)}</Text>
        ),
    },
    {
        Header: "top reps",
        accessor: "series.reps",
        // TODO tag si best
        Cell: (props) => (
            <Text>{(props.row.original as Exercise).series.reduce((max, serie) => Math.max(max, serie.reps), 0)}</Text>
        ),
    },
];
