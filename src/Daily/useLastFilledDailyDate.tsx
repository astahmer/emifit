import { printDate } from "@/functions/utils";
import { orm } from "@/orm";
import { currentDateAtom } from "@/store";
import { useAtomValue } from "jotai";
import { useQuery } from "react-query";

export const useLastFilledDailyDate = () => {
    const currentDate = useAtomValue(currentDateAtom);
    const query = useQuery(["daily", "closestPreviousDailyEntry", currentDate], async () => {
        const tx = orm.db.transaction("daily");

        let cursor = await tx.store
            .index("by-time")
            // looking for the first (x) entry before the current date
            // (x) < currentDate
            .openCursor(IDBKeyRange.upperBound(new Date(currentDate).getTime()), "prev");

        let lastDate: Date | null = null;
        while (cursor) {
            if (cursor.value.date < currentDate && cursor.value.exerciseList.length) {
                lastDate = cursor.value.date;
                break;
            }

            cursor = await cursor.continue();
        }

        return lastDate;
    });

    return query.data;
};

export const useLastFilledDaily = () => {
    const lastFilledDailyDate = useLastFilledDailyDate();
    const dailyId = lastFilledDailyDate && printDate(lastFilledDailyDate);
    const query = useQuery(["lastFilledDaily", lastFilledDailyDate], () => orm.daily.find(dailyId), {
        enabled: Boolean(dailyId),
    });

    return query.data;
};
