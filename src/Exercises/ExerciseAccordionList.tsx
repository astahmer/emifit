import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { useExerciseList } from "@/store";
import { Exercise, Serie } from "@/orm-types";
import { StringOrNumber, WithOnChange } from "@/types";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Badge,
    Stack,
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    Text,
    useCheckboxGroup,
    UseCheckboxGroupReturn,
} from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { CheckboxSquare } from "../components/CheckboxCircle";
import { ExerciseTag } from "./ExerciseTag";

export const ExerciseAccordionList = ({ onChange }: WithOnChange<StringOrNumber[]>) => {
    const exercises = useExerciseList();
    const interpret = useProgramInterpret();
    const catId = useSelector(interpret, (s) => s.context.categoryId);
    const exerciseList = useSelector(interpret, (s) => s.context.exerciseList);

    const { getCheckboxProps } = useCheckboxGroup({ onChange, defaultValue: exerciseList.map((ex) => ex.id) });

    return (
        <Accordion allowToggle w="100%">
            {exercises
                .filter((ex) => ex.category === catId)
                .map((exercise) => (
                    <ExerciseAccordion key={exercise.id} exercise={exercise} getCheckboxProps={getCheckboxProps} />
                ))}
        </Accordion>
    );
};

const ExerciseAccordion = ({
    exercise,
    getCheckboxProps,
}: { exercise: Exercise } & Pick<UseCheckboxGroupReturn, "getCheckboxProps">) => {
    return (
        <AccordionItem w="100%">
            <AccordionButton w="100%">
                <Stack direction="row" alignItems="center" w="100%">
                    <CheckboxSquare {...getCheckboxProps({ value: exercise.id })} />
                    <Stack alignItems="flex-start" w="100%">
                        <Text>{exercise.name}</Text>
                        {Boolean(exercise.tags?.length) && (
                            <Stack direction="row">
                                {exercise.tags.map((tag) => (
                                    <ExerciseTag key={tag.id} tag={tag} />
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
                <StatLabel>Série {index + 1}</StatLabel>
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
