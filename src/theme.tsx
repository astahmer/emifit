import { extendTheme } from "@chakra-ui/react";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";

export const appTheme = extendTheme(CalendarDefaultTheme, { config: { initialColorMode: "light" } });
