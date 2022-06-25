import { DynamicTable } from "@/components/DynamicTable";
import { CategoryRadioPicker } from "@/Exercises/CategoryRadioPicker";
import { ExerciseTagList } from "@/Exercises/ExerciseTag";
import { useCategoryList, useExerciseList, useExerciseUnsortedList } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Divider,
    Flex,
    Heading,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const ExerciseLibraryPage = () => {
    const categoryList = useCategoryList();
    const [byCategory, setByCategory] = useState<string>();

    useEffect(() => {
        if (!byCategory && categoryList.length) {
            setByCategory(categoryList[0].id);
        }
    }, [categoryList, byCategory]);

    const exerciseList = useExerciseList({ index: "by-category", query: byCategory });

    return (
        <Box id="ExerciseLibraryPage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">Exercise Library</Heading>
            {byCategory && (
                <Box mt="4">
                    <CategoryRadioPicker defaultValue={byCategory} onChange={setByCategory} />
                </Box>
            )}
            <Flex flexDirection="column" mt="4" h="100%" minH="0" overflow="auto">
                <Accordion allowToggle w="100%">
                    {/* TODO virtual */}
                    {exerciseList.map((exo) => (
                        <ExerciseLibraryItem key={exo.id} exercise={exo} />
                    ))}
                </Accordion>
                <Divider my="2" />
            </Flex>
        </Box>
    );
};

const ExerciseLibraryItem = ({ exercise }: { exercise: Exercise }) => {
    const query = useExerciseUnsortedList({ index: "by-name", query: exercise.name });
    const exerciseList = (query.data || []).filter((exo) => !Boolean(exo.programId));

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
        Cell: (props) => <Text>{new Date(props.value).toLocaleDateString()}</Text>,
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
