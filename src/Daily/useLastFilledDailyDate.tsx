import { parseDate, printDate } from "@/functions/utils";
import { orm } from "@/orm";
import { useQuery } from "react-query";

export const useLastFilledDailyDate = () => {
    const query = useQuery(["daily", "keys"], () => orm.daily.keys({ count: 1 }));
    const keys = query.data || [];

    return keys[0] ? parseDate(keys[0]) : null;
};
export const useLastFilledDaily = () => {
    const lastFilledDailyDate = useLastFilledDailyDate();
    const dailyId = lastFilledDailyDate && printDate(lastFilledDailyDate);
    const query = useQuery(["lastFilledDaily"], () => orm.daily.find(dailyId), { enabled: Boolean(dailyId) });

    return query.data;
};
