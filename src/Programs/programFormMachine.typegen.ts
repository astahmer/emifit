// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    eventsCausingActions: {
        popHistoryStack: "GoBack";
        assignCategory: "SelectCategory";
        createExercise: "CreateExercise";
        filterExercisesWithPrevCategory: "SelectCategory";
        updateSelection: "UpdateSelection" | "ConfirmEditing";
        unselectExercise: "UnselectExercise";
        assignProgramName: "Submit";
        selectExercise: "AddExercise";
        pushHistoryStack: "xstate.init";
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
        hasExercisesInCategory: "SelectCategory";
        hasNotSelectedExercises: "GoToSelectExercises";
        isSelectionEmpty: "UpdateSelection";
        hasNoExercisesInCategory: "SelectCategory";
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
        | "creating.selectingExercises.emptySelection"
        | "creating.selectingExercises.hasSelection"
        | "creating.editSettings"
        | "creating.editSettings.initial"
        | "creating.editSettings.editingExerciseList"
        | "done"
        | {
              creating?:
                  | "selectingCategory"
                  | "maybeCreatingExercise"
                  | "selectingExercises"
                  | "editSettings"
                  | {
                        maybeCreatingExercise?: "shouldCreateChoice" | "creatingExercise";
                        selectingExercises?: "emptySelection" | "hasSelection";
                        editSettings?: "initial" | "editingExerciseList";
                    };
          };
    tags: never;
}
