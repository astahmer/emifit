import { CalendarButton } from "@/components/CalendarButton";
import { ChevronLeftIcon, ChevronRightIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, Heading, HStack, IconButton, ListItem, OrderedList, Text } from "@chakra-ui/react";
import { Fragment } from "react";

export const HomePage = () => {
    return (
        <>
            <Header />
            <Flex flexDirection="column" h="100%">
                <Flex justifyContent="space-between" alignItems="center" px="6">
                    <Heading as="h3" size="lg">
                        Category 1
                    </Heading>
                    <Button leftIcon={<EditIcon />} colorScheme="twitter" variant="solid">
                        Edit
                    </Button>
                </Flex>
                <Divider mt="4" />
                <ExerciseList />
            </Flex>
        </>
    );
};

const Header = () => {
    return (
        <Flex p="4" justifyContent="space-between" alignItems="center">
            <ChevronLeftIcon fontSize="32px" />
            <CalendarButton />
            {/* <Text c>
                17/02/2022
            </Text> */}
            <ChevronRightIcon fontSize="32px" />
        </Flex>
    );
};

const exos = [
    { name: "Exercise 1" },
    { name: "Exercise 2" },
    { name: "Exercise 3" },
    { name: "Exercise 4" },
    { name: "Exercise 5" },
];
const ExerciseList = () => {
    return (
        <Flex flexDir="column" pt="2" overflow="auto" h="100%">
            {exos.map((exo, index) => {
                return (
                    <Fragment key={index}>
                        {index > 0 && (
                            <Box px="8">
                                <Divider my="2" />
                            </Box>
                        )}
                        <ExerciseItem exo={exo} />
                    </Fragment>
                );
            })}
        </Flex>
    );
};

interface ExoItem {
    name: string;
}

function ExerciseItem({ exo }: { exo: ExoItem }) {
    return (
        <Flex flexDirection="column" px="8">
            <Flex w="100%" alignItems="flex-end">
                <Heading as="h4" size="md">
                    {exo.name}
                </Heading>
                <HStack ml="auto" mt="2">
                    <IconButton
                        rounded="full"
                        variant="solid"
                        size="sm"
                        colorScheme="twitter"
                        aria-label="Edit"
                        icon={<EditIcon />}
                    />
                    <IconButton
                        rounded="full"
                        variant="solid"
                        size="sm"
                        colorScheme="red"
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                    />
                </HStack>
            </Flex>
            <Text fontWeight="normal" fontSize="sm" color="gray.500">
                XX sets of YY reps
            </Text>
            <OrderedList mt="2">
                <ListItem>Lorem ipsum dolor sit amet</ListItem>
                <ListItem>Consectetur adipiscing elit</ListItem>
                <ListItem>Integer molestie lorem at massa</ListItem>
                <ListItem>Facilisis in pretium nisl aliquet</ListItem>
            </OrderedList>
        </Flex>
    );
}
