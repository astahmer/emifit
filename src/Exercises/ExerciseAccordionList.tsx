import { useExerciseList } from "@/orm-hooks";
import { Exercise, Serie } from "@/orm-types";
import { useProgramInterpret } from "@/Programs/useProgramInterpret";
import { StringOrNumber, WithOnChange } from "@/types";
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Stack,
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    Text,
    useCheckboxGroup,
    UseCheckboxGroupReturn,
} from "@chakra-ui/react";
import { sortArrayOfObjectByPropFromArray } from "@pastable/core";
import { useSelector } from "@xstate/react";
import { CheckboxSquare } from "../components/CheckboxCircle";
import { ExerciseTagList } from "./ExerciseTag";

export const ExerciseAccordionList = ({
    exerciseList,
    onChange,
}: WithOnChange<StringOrNumber[]> & { exerciseList: Exercise[] }) => {
    const interpret = useProgramInterpret();
    const catId = useSelector(interpret, (s) => s.context.categoryId);
    const selectedExerciseList = useSelector(interpret, (s) => s.context.exerciseList);

    const names = selectedExerciseList.map((exo) => exo.name);

    const { getCheckboxProps } = useCheckboxGroup({ onChange, defaultValue: selectedExerciseList.map((ex) => ex.id) });

    return (
        <Accordion allowToggle w="100%">
            {sortArrayOfObjectByPropFromArray(
                exerciseList.filter((exo) => !names.includes(exo.name)).concat(selectedExerciseList),
                "id",
                exerciseList.map((exo) => exo.id)
            ).map((exercise) => (
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
                    <CheckboxSquare getIconProps={() => ({ mr: "2" })} {...getCheckboxProps({ value: exercise.id })} />
                    <Stack alignItems="flex-start" w="100%">
                        <Text>{exercise.name}</Text>
                        {Boolean(exercise.tags?.length) && <ExerciseTagList tagList={exercise.tags} />}
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
                <StatLabel>Set {index + 1}</StatLabel>
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
