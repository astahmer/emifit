import { Exercise, Serie, useExerciseList } from "@/store";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Avatar,
    Badge,
    Stack,
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    Tag,
    TagLabel,
    Text,
    useCheckboxGroup,
    UseCheckboxGroupReturn,
} from "@chakra-ui/react";
import { CheckboxCircle } from "../components/CheckboxCircle";

export const ExerciseAccordionList = () => {
    const exercises = useExerciseList();

    const { value, getCheckboxProps } = useCheckboxGroup();
    console.log(value);

    return (
        <Accordion allowToggle w="100%">
            {exercises.map((exercise) => (
                <ExerciseAccordion key={exercise.id} exercise={exercise} getCheckboxProps={getCheckboxProps} />
            ))}
        </Accordion>
    );
};
const ExerciseAccordion = ({
    exercise,
    getCheckboxProps,
}: { exercise: Exercise } & Pick<UseCheckboxGroupReturn, "getCheckboxProps">) => {
    console.log(exercise);
    return (
        <AccordionItem w="100%">
            <AccordionButton w="100%">
                <Stack direction="row" alignItems="center" w="100%">
                    <CheckboxCircle {...getCheckboxProps({ value: exercise.id })} />
                    <Stack alignItems="flex-start" w="100%">
                        <Text>{exercise.name}</Text>
                        {Boolean(exercise.tags?.length) && (
                            <Stack direction="row">
                                {exercise.tags.map((tag) => (
                                    <Badge key={tag.id} variant="subtle" colorScheme="pink" fontSize="xx-small">
                                        {tag.label}
                                    </Badge>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Stack>
                <AccordionIcon ml="auto" />
            </AccordionButton>
            <AccordionPanel
                pb={4}
                borderWidth="1px"
                borderColor="pink.100"
                borderRadius="md"
                borderTopLeftRadius={0}
                borderTopRightRadius={0}
            >
                <Stack spacing="4">
                    {exercise.series.map((serie, index) => (
                        <ExerciseSerie key={serie.id} serie={serie} index={index} />
                    ))}
                </Stack>
            </AccordionPanel>
        </AccordionItem>
    );
};
const ExerciseSerie = ({ serie, index }: { serie: Serie; index: number }) => {
    return (
        <StatGroup>
            <Stat alignSelf="center">
                <StatLabel>Série {index}</StatLabel>
            </Stat>
            <Stat>
                <StatLabel>kg</StatLabel>
                <StatNumber fontSize="md">{serie.kg}</StatNumber>
            </Stat>
            <Stat>
                <StatLabel>reps</StatLabel>
                <StatNumber fontSize="md">{serie.kg}</StatNumber>
            </Stat>
        </StatGroup>
    );
};
const ExerciseName = ({ exercise }: { exercise: Exercise }) => {
    return (
        <Tag size="lg" colorScheme="red" borderRadius="full">
            <TagLabel>{exercise.name}</TagLabel>
            <Avatar size="xs" name={String(exercise.nbSeries)} ml={-1} mr={2} />
        </Tag>
    );
};
