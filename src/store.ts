import { CalendarDate } from "@uselessdev/datepicker";
import { isToday } from "date-fns";
import { createBrowserHistory } from "history";
import { atom, unstable_createStore } from "jotai";
import { printDate } from "./functions/utils";
import { getDailyIdFromUrl, parseDailyDateFromUrl, printDailyDate } from "./orm-utils";

export const store = unstable_createStore();
export const browserHistory = createBrowserHistory({ window });

const withLogs = false;
const log = (...args: any[]) => withLogs && console.log(...args);

let wasUpdatedFromBackButton = false;
browserHistory.listen((update) => {
    log("browserHistory.listen update", update);
    if (update.action === "PUSH") {
        // When navigating to the homepage, sets the location.pathname to the currentDate daily entry id
        // (from: "/[anything]" to "/daily/entry/:id")
        if (update.location.pathname === "/") {
            log("history 1", update);
            const dailyId = printDailyDate(store.get(currentDateAtom));
            return browserHistory.replace(`/daily/entry/${dailyId}`);
        }

        // Updates the currentDate to the current daily entry date
        // (from: "/daily/entry/:someId" to "/daily/entry/:anotherId")
        // -> when navigating using BottomTabs.Add when today's daily has not been created yet
        if (
            update.location.pathname.startsWith("/daily/entry/") &&
            update.location.pathname.includes(getDailyIdFromUrl(update.location.pathname))
        ) {
            log("history 2", update, parseDailyDateFromUrl(window.location.href));
            return store.set(currentDateAtom, parseDailyDateFromUrl(window.location.href));
        }
    }

    // When navigating using the browser back button, sets currentDate to the date of the previous (now current) location.pathname
    // (from: "/[anything]" to "/daily/entry/:id")
    if (update.action === "POP" && update.location.pathname.startsWith("/daily/entry/")) {
        log("history 3", update);
        wasUpdatedFromBackButton = true;
        return store.set(currentDateAtom, parseDailyDateFromUrl(window.location.href));
    }
});

export const debugModeAtom = atom<boolean>(false);
export const showSkeletonsAtom = atom<boolean>(false);

const today = parseDailyDateFromUrl(window.location.href) || new Date();
export const currentDateAtom = atom<CalendarDate>(today);
export const currentDailyIdAtom = atom((get) => printDate(get(currentDateAtom)));
export const isDailyTodayAtom = atom((get) => isToday(get(currentDateAtom)));

export const isCompactViewAtom = atom(true);

store.sub(currentDateAtom, () => {
    // Only ever update the location.pahtname if the user is on the homepage either as "/" or from "/daily/entry/:id"
    const shouldUpdateLocation =
        browserHistory.location.pathname === "/" || browserHistory.location.pathname.startsWith("/daily/entry/");
    if (!shouldUpdateLocation) return;

    const dailyId = printDailyDate(store.get(currentDateAtom));
    const dailyEntryPath = `/daily/entry/${dailyId}`;

    // Updates the location.pathname to the current daily entry id
    // (from: "/" to "/daily/entry/:id")
    // -> when initial navigation is on the homepage
    if (browserHistory.location.pathname === "/") {
        log("atom 1", dailyId, browserHistory.location.pathname);
        return browserHistory.replace(dailyEntryPath);
    }

    if (wasUpdatedFromBackButton) {
        wasUpdatedFromBackButton = false;
        return;
    }

    if (browserHistory.location.pathname.startsWith(dailyEntryPath)) {
        // Nothing to do, the location.pathname is already correct (= in sync with currentDateAtom & is today's daily entry)
        if (store.get(isDailyTodayAtom)) return;

        // -> when initial navigation is on "/daily/entry/:id/exercise/[anything]"
        // but we shouldn't be there since it's not today's daily entry so we can't update it anymore
        if (browserHistory.location.pathname.replace(dailyEntryPath, "").startsWith("/exercise/")) {
            log("atom 2", dailyId, browserHistory.location.pathname);
            return browserHistory.replace(dailyEntryPath);
        }

        return;
    }

    // Updates the location.pathname to the current daily entry id
    // (from: "/daily/entry/:someId" to "/daily/entry/:anotherId")
    // -> when navigating using Header.Calendar Prev/Next buttons
    log("atom 3", dailyId, browserHistory.location.pathname);
    browserHistory.push(dailyEntryPath);
});

export const isSwipingCarouselRef = { current: false };
