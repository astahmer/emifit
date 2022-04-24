import { parseDate, printDate } from "@/functions/utils";
import { orm } from "@/orm";
import { currentDateAtom } from "@/store";
import { useAtomValue } from "jotai";
import { useQuery } from "react-query";

export const useLastFilledDailyDate = () => {
    const currentDate = useAtomValue(currentDateAtom);
    const query = useQuery(["daily", "keys"], () => orm.daily.keys({ count: 1 })); // TODO index by-time + query lowerbound ?
    const keys = query.data || [];

    if (!keys[0]) return null;

    const date = parseDate(keys[0]);
    return date < currentDate ? date : null;
};

export const useLastFilledDaily = () => {
    const lastFilledDailyDate = useLastFilledDailyDate();
    const dailyId = lastFilledDailyDate && printDate(lastFilledDailyDate);
    const query = useQuery(["lastFilledDaily"], () => orm.daily.find(dailyId), { enabled: Boolean(dailyId) });

    return query.data;
};
