// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    eventsCausingActions: {};
    internalEvents: {
        "xstate.init": { type: "xstate.init" };
    };
    invokeSrcNameMap: {};
    missingImplementations: {
        actions: never;
        services: never;
        guards: never;
        delays: never;
    };
    eventsCausingServices: {};
    eventsCausingGuards: {};
    eventsCausingDelays: {};
    matchesStates:
        | "initial"
        | "creating"
        | "creating.withoutCategory"
        | "creating.categorySelected"
        | "creating.selectingExercises"
        | { creating?: "withoutCategory" | "categorySelected" | "selectingExercises" };
    tags: never;
}
