import { extendTheme, Theme } from "@chakra-ui/react";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";

export const appTheme = extendTheme(CalendarDefaultTheme, { config: { initialColorMode: "light" } } as Theme, {
    components: {
        CalendarControl: {
            parts: ["button"],
            baseStyle: {
                button: {
                    h: 6,
                    px: 2,
                    rounded: "none",
                    fontSize: "sm",
                    color: "white",
                    bgColor: "pink.400",
                    _hover: {
                        bgColor: "pink.300",
                    },
                    _focus: {
                        outline: "none",
                    },
                },
            },
        },
        CalendarDay: {
            variants: {
                filled: {
                    color: "pink.300",
                },
            },
        },
    },
});
