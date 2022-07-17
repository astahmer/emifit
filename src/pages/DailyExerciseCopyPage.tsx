import { Show } from "@/components/Show";
import { useExerciseByIdQuery } from "@/orm-hooks";
import { useSearchParams } from "react-router-dom";
import { DailyExerciseAddPage } from "./DailyExerciseAddPage";
import { DailyExercisePageLayoutSkeleton } from "./DailyExercisePageLayout";

export const DailyExerciseCopyPage = () => {
    const [searchParams] = useSearchParams();
    const exerciseId = searchParams.get("exoId");
    const exerciseQuery = useExerciseByIdQuery(exerciseId);
    const exercise = exerciseQuery.data;

    return (
        <Show when={Boolean(exercise)} fallback={<DailyExercisePageLayoutSkeleton />}>
            <DailyExerciseAddPage exercise={exercise} />
        </Show>
    );
};
