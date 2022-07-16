import { SortByDirection } from "@/components/SortByIconButton";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { Exercise } from "@/orm-types";
import { assign, createMachine, InterpreterFrom } from "xstate";

const initialContext = {
    selected: null as Exercise,
    category: null as string,
    tagList: [] as string[],
    sortByDirection: "asc" as SortByDirection,
};

export const [ExerciseFiltersProvider, useExerciseFilters] =
    createContextWithHook<InterpreterFrom<typeof ExerciseFiltersMachine>>("ExerciseLibraryFilters");

export const ExerciseFiltersMachine = createMachine(
    {
        id: "ExerciseFilters",
        schema: {
            context: {} as typeof initialContext,
            events: {} as
                | { type: "SelectExercise"; exercise: Exercise }
                | { type: "UpdateCategory"; category: string }
                | { type: "UpdateTagList"; tagList: string[] }
                | { type: "UpdateSortByDirection"; direction: SortByDirection },
        },
        tsTypes: {} as import("./ExerciseFiltersMachine.typegen").Typegen0,
        context: initialContext,
        initial: "idle",
        states: {
            idle: {
                on: {
                    UpdateCategory: { actions: "updateCategory" },
                    SelectExercise: { actions: "selectExercise" },
                    UpdateTagList: { actions: "updateTagList" },
                    UpdateSortByDirection: { actions: "updateSortByDirection" },
                },
            },
        },
    },
    {
        actions: {
            selectExercise: assign({ selected: (_, event) => event.exercise }),
            updateCategory: assign({ category: (ctx, event) => event.category }),
            updateTagList: assign({ tagList: (ctx, event) => event.tagList }),
            updateSortByDirection: assign({ sortByDirection: (ctx, event) => event.direction }),
        },
    }
);
