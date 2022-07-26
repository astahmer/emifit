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
        Table: {
            sizes: {
                xs: {
                    th: {
                        px: "3",
                        py: "0.5",
                        lineHeight: "2",
                        fontSize: "x-small",
                    },
                    td: {
                        px: "3",
                        py: "1",
                        fontSize: "xs",
                        lineHeight: "2",
                    },
                    caption: {
                        px: "3",
                        py: "1",
                        fontSize: "x-small",
                    },
                },
                "x-small": {
                    th: {
                        px: "2",
                        py: "1",
                        lineHeight: "1",
                        fontSize: "xx-small",
                    },
                    td: {
                        px: "2",
                        py: "1",
                        fontSize: "xs",
                        lineHeight: "1",
                    },
                    caption: {
                        px: "2",
                        py: "1",
                        fontSize: "xx-small",
                    },
                },
            },
        },
    },
});
