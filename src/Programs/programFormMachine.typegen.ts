// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    eventsCausingActions: {
        assignCategory: "SelectCategory";
        filterExercisesWithPrevCategory: "SelectCategory";
        createExercise: "CreateExercise";
        addExercise: "PickExercise";
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
        hasExercises: "SelectCategory";
    };
    eventsCausingDelays: {};
    matchesStates:
        | "initial"
        | "creating"
        | "creating.selectingCategory"
        | "creating.maybeCreatingExercise"
        | "creating.maybeCreatingExercise.shouldCreateChoice"
        | "creating.maybeCreatingExercise.creatingExercise"
        | "creating.selectingExercises"
        | "creating.editSettings"
        | "done"
        | {
              creating?:
                  | "selectingCategory"
                  | "maybeCreatingExercise"
                  | "selectingExercises"
                  | "editSettings"
                  | { maybeCreatingExercise?: "shouldCreateChoice" | "creatingExercise" };
          };
    tags: never;
}
