import { CalendarDate } from "@uselessdev/datepicker";
import { isToday } from "date-fns";
import { createBrowserHistory } from "history";
import { atom, unstable_createStore } from "jotai";
import { parseDate, printDate } from "./functions/utils";

export const store = unstable_createStore();
export const browserHistory = createBrowserHistory({ window });

let wasUpdatedFromBackButton = false;
browserHistory.listen((update) => {
    // When navigating to the homepage, sets the location.pathname so the currentDate daily entry id
    // (from: "/[anything]" to "/daily/entry/:id")
    if (update.action === "PUSH" && update.location.pathname === "/") {
        const dailyId = printDate(store.get(currentDateAtom)).replaceAll("/", "-");
        return browserHistory.replace(`/daily/entry/${dailyId}`);
    }

    // When navigating using the browser back button, sets currentDate to the date of the previous (now current) location.pathname
    // (from: "/[anything]" to "/daily/entry/:id")
    if (update.action === "POP" && update.location.pathname.startsWith("/daily/entry/")) {
        wasUpdatedFromBackButton = true;
        store.set(
            currentDateAtom,
            parseDate(update.location.pathname.replace("/daily/entry/", "").replaceAll("-", "/"))
        );
    }
});

export const debugModeAtom = atom<boolean>(false);
export const showSkeletonsAtom = atom<boolean>(false);

const today = new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentDailyIdAtom = atom((get) => printDate(get(currentDateAtom)));
export const isDailyTodayAtom = atom((get) => isToday(get(currentDateAtom)));

export const isCompactViewAtom = atom(true);

store.sub(currentDateAtom, () => {
    // Only ever update the location.pahtname if the user is on the homepage either as "/" or from "/daily/entry/:id"
    const shouldUpdateLocation =
        browserHistory.location.pathname === "/" || browserHistory.location.pathname.startsWith("/daily/entry/");
    if (!shouldUpdateLocation) return;

    const dailyId = printDate(store.get(currentDateAtom)).replaceAll("/", "-");

    // Updates the location.pathname to the current daily entry id
    // (from: "/" to "/daily/entry/:id")
    if (browserHistory.location.pathname === "/") {
        return browserHistory.replace(`/daily/entry/${dailyId}`);
    }

    if (wasUpdatedFromBackButton) {
        wasUpdatedFromBackButton = false;
        return;
    }

    // Updates the location.pathname to the current daily entry id
    // (from: "/daily/entry/:someId" to "/daily/entry/:anotherId")
    browserHistory.push(`/daily/entry/${dailyId}`);
});
