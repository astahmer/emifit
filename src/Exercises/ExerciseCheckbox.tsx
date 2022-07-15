import { CheckboxSquare } from "@/fields/CheckboxCircle";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Exercise } from "@/orm-types";
import { isDailyTodayAtom } from "@/store";
import { useAtomValue } from "jotai";
import { useMutation } from "react-query";

export function ExerciseCheckbox({ exo }: { exo: Exercise }) {
    const daily = useCurrentDaily();
    const isDailyToday = useAtomValue(isDailyTodayAtom);

    const addExerciseToDailyCompletedList = useMutation(
        (checked: boolean) =>
            orm.daily.upsert(daily.id, (current) => ({
                ...current,
                completedList: checked
                    ? current.completedList.concat(exo.id)
                    : current.completedList.filter((completed) => exo.id !== completed),
            })),
        { onSuccess: daily.invalidate }
    );

    return (
        <CheckboxSquare
            getIconProps={() => ({ size: "sm" })}
            defaultChecked={daily.completedList.some((completed) => completed === exo.id)}
            onChange={(e) => addExerciseToDailyCompletedList.mutate(e.target.checked)}
            isDisabled={!isDailyToday}
        />
    );
}
