// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    eventsCausingActions: {
        addExercise: "AddExercise";
        updateForm: "UpdateForm";
        removeExercise: "RemoveExercise";
        updateSupersetForm: "UpdateSupersetForm";
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
    eventsCausingGuards: {
        hasFilledSingleForm: "UpdateForm";
        hasNotFilledSingleForm: "UpdateForm";
        hasAllSupersetFormFilled: "UpdateSupersetForm";
        hasNotAllSupersetFormFilled: "UpdateSupersetForm";
    };
    eventsCausingDelays: {};
    matchesStates:
        | "single"
        | "single.editing"
        | "single.canSubmit"
        | "superset"
        | "superset.editing"
        | "superset.canSubmit"
        | { single?: "editing" | "canSubmit"; superset?: "editing" | "canSubmit" };
    tags: never;
}
