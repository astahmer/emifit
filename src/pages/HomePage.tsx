import { CalendarButton } from "@/components/CalendarButton";
import { MultiSelect } from "@/components/MultiSelect";
import { Categories } from "@/constants";
import { currentDateAtom } from "@/store";
import { ChevronLeftIcon, ChevronRightIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    ListItem,
    OrderedList,
    Popover,
    PopoverAnchor,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { addDays, isFuture } from "date-fns";
import { useAtom } from "jotai";
import { Fragment } from "react";

export const HomePage = () => {
    return (
        <>
            <Header />
            <DayExcercises />
        </>
    );
};

const Header = () => {
    const [date, setDate] = useAtom(currentDateAtom);
    const isNextDayInFuture = isFuture(addDays(date, 1));

    return (
        <Flex p="4" justifyContent="space-between" alignItems="center">
            <IconButton
                variant="unstyled"
                aria-label="Prev day"
                icon={<ChevronLeftIcon fontSize="32px" />}
                onClick={() => setDate((current) => addDays(current, -1))}
            />
            <CalendarButton selectedDate={date} onChange={setDate} />
            <IconButton
                variant="unstyled"
                aria-label="Next day"
                icon={<ChevronRightIcon fontSize="32px" />}
                isDisabled={isNextDayInFuture}
                onClick={() => setDate((current) => addDays(current, 1))}
            />
        </Flex>
    );
};

const DayExcercises = () => {
    return (
        <Flex flexDirection="column" h="100%">
            <DayCategory />
            <Divider mt="4" />
            <ExerciseList />
        </Flex>
    );
};

const DayCategory = () => {
    const items = Categories.map((cat) => cat);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Flex justifyContent="space-between" alignItems="center" px="6">
            <Box pos="relative">
                <Popover isOpen={isOpen} onClose={onClose} closeOnBlur>
                    <MultiSelect
                        isOpen={isOpen}
                        getValue={(item) => item.id}
                        itemToString={(item) => item.label}
                        items={items}
                        onChange={(item) => {
                            console.log(item);
                            onClose();
                        }}
                        isMulti={false}
                        renderButton={(props) => (
                            <PopoverAnchor>
                                <Heading {...props.getButtonProps()} as="h3" size="lg">
                                    Category 1
                                </Heading>
                            </PopoverAnchor>
                        )}
                        // <PopoverTrigger>
                        //     <Button variant="unstyled">
                        //     </Button>
                        // </PopoverTrigger>
                        renderList={({ ListComponent, ...props }) =>
                            isOpen ? (
                                <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody>
                                        <ListComponent {...props} />
                                    </PopoverBody>
                                </PopoverContent>
                            ) : null
                        }
                    />
                </Popover>
            </Box>

            <Button leftIcon={<EditIcon />} colorScheme="twitter" variant="solid" onClick={onOpen}>
                Edit
            </Button>
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
                    {/* TODO link to add page avec valeurs préfill */}
                    <IconButton
                        rounded="full"
                        variant="solid"
                        size="sm"
                        colorScheme="purple"
                        aria-label="Edit"
                        icon={<EditIcon />}
                    />
                    {/* Confirmation */}
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
