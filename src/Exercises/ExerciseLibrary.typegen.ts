// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    eventsCausingActions: {
        updateName: "UpdateName";
        updateTagList: "UpdateTagList";
        updateSortDirection: "UpdateSortDirection";
    };
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
        | "idle"
        | "hasCategory"
        | "hasCategory.idle"
        | "hasCategory.processingInput"
        | { hasCategory?: "idle" | "processingInput" };
    tags: never;
}
