import { Show } from "@/components/Show";
import { Serie } from "@/orm-types";
import { OrderedList, ListProps, ListItem, Text, TextProps } from "@chakra-ui/react";
import { getSum } from "@pastable/core";

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
            <Show when={setList.length > 1}>
                <span>
                    Total: {getSum(setList.map((s) => s.kg))} kgs / {getSum(setList.map((s) => s.reps))} reps
                </span>
            </Show>
        </OrderedList>
    );
};

export const ExerciseSetListOverview = ({ setList, ...props }: { setList: Serie[] } & TextProps) => (
    <Text fontWeight="normal" fontSize="sm" color="gray.500" {...props}>
        {setList.length} sets of {setList.map((set) => set.reps).join("/")} reps
    </Text>
);
