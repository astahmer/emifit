import { Serie } from "@/orm-types";
import { OrderedList, ListProps, ListItem, Text, TextProps } from "@chakra-ui/react";

export const ExerciseSetList = ({ setList, ...props }: { setList: Serie[] } & ListProps) => {
    return (
        <OrderedList
            listStylePosition="inside"
            css={{
                counterReset: "item",
                li: { counterIncrement: "item" },
                "li::marker": { content: `"- Set " counter(item) ": "` },
            }}
            {...props}
        >
            {setList.map((serie) => (
                <ListItem key={serie.id}>
                    {serie.kind === "warmup" ? "(warmup) " : ""} with {serie.kg} kg / {serie.reps} reps
                </ListItem>
            ))}
        </OrderedList>
    );
};

export const ExerciseSetListOverview = ({ setList, ...props }: { setList: Serie[] } & TextProps) => (
    <Text fontWeight="normal" fontSize="sm" color="gray.500" {...props}>
        {setList.length} sets of {setList.map((set) => set.reps).join("/")} reps
    </Text>
);
