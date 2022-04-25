import { ExerciseGridView } from "@/Exercises/ExerciseGrid";
import { WithExerciseList } from "@/orm-types";

export const DailyExerciseGridView = ({ exerciseList }: WithExerciseList) => {
    return <ExerciseGridView exerciseList={exerciseList} />;
};
