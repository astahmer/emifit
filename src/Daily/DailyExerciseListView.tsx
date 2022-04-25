import { ScrollableStack } from "@/components/Scrollable";
import { WithExerciseList } from "@/orm-types";
import { Heading } from "@chakra-ui/react";

export const DailyExerciseListView = ({ exerciseList }: WithExerciseList) => {
    return (
        <ScrollableStack>
            {exerciseList.map((exo) => (
                <Heading as="h4" size="md" key={exo.id}>
                    {exo.name}
                </Heading>
            ))}
        </ScrollableStack>
    );
};
