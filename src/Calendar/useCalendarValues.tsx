import { createContextWithHook } from "@/functions/createContextWithHook";
import { SetState } from "pastable";
import { CalendarValues } from "@uselessdev/datepicker";

export const [CalendarValuesProvider, useCalendarValues] = createContextWithHook<
    CalendarValues & { setDates: SetState<CalendarValues> }
>("CalendarValues");
