import { getStatesPathValue } from "@/functions/xstate-utils";
import { Exercise } from "@/store";
import { omit } from "@pastable/core";
import { assign, createMachine } from "xstate";

interface ProgramCtx {
    categoryId: string;
    exerciseList: Exercise[];
    prevState: string;
}

export const programFormMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7KqCGBbAYuqrgHQCWAdmQC5nYA2AxAMrXarUDCqY2tFUAAoYseRCnSwaZdBXEgAHogCsAJgA0IAJ6IAzADYADCQCcZkwHYAHAEY1hk8uUAWAL6vNaTDgJFSAYx4+SigSWDB6MH9+KE4+MCgiLRYIqK54xNQdJBBkSWlZeSUEXUMLEmdDfVV9K2V9SzMLTWyLG2dTc30bWosTUv13TxEfQmISQN4YklxsLQAjMG4pkIBRBTBUfzJwsIALdABXeghl+M4Dsn8wRgBxdAAVdDPqMHXN7fD5PKlaQpzirprCR9PVVM4rKVVMpdJYWogbDZdKpOmZYbVdE5dENciM8GMAkFprMFksiWsNlsdmB9kcTi8lpdrndHuhmKlou8qeF4DkfgU5ADEFYaiRrDZVD0TKoDP1dPCEBKjBVzLKkc5nLUcV5RL5xpNggIZnNFi8KR9qRNyQIuZ8bgzbdTvvk-oLQMVnHYSEDlIYyoYNRYLPpnMoFTYqlZUSZQ6oZcHlBZtXi9YSVkbwpFoubuXAUlnqI6ec7fjI3YoEQ5dCQRYZdJVVCYyiYbFZw6pDCjnOZnLpkRCLAH3B4QBR0BA4N8UwTyFRaAwSwKiohnBptIgm9GrE3gwHrMnvPi-Fb06FM2kQnFXplshJS-93Ru160etGQ0CTFY-W4RzrRseDWJE0yVPIsaVgA5jlOIlGXQK4wEXV1l0VZFw0MWxo1DVtNWcCxlAPXUZ0AkJjVJM0bUpO0T0NKAwMQstkOUbcSHaKp6wjQcsLQr8az7VQ+lXSEbAI-99WtUISVNcS6L5F0GKFRV0IVMxlGjep2iDVsRKPMTTzCDkYjA3k7yXBSI09FjKkTKxrG3epnHbNoVTRIMrE1JjtNTaiYnoh8KwQWoFRDGxowsGpESsEUTE8glfPLYpW3DKxh1cIA */
    createMachine(
        {
            tsTypes: {} as import("./programFormMachine.typegen").Typegen0,
            schema: {
                context: {} as ProgramCtx & { stack: ProgramCtx[] },
                events: {} as
                    | { type: "GoBack" }
                    | { type: "StartCreatingProgram" }
                    | { type: "SelectCategory"; categoryId: string; hasExercises: boolean }
                    | { type: "CreateExercise"; exercise: Exercise }
                    | { type: "GoToCreateExercise" }
                    | { type: "GoToSelectExercises" }
                    | { type: "UpdateSelection"; selection: Exercise[] }
                    | { type: "GoToProgramSettings" }
                    | { type: "StartEditingExerciseList" }
                    | { type: "CancelEditing" }
                    | { type: "ConfirmEditing"; selection: Exercise[] }
                    | { type: "AddExercise"; exercise: Exercise }
                    | { type: "UnselectExercise"; exerciseId: string }
                    | { type: "Submit"; programName: string },
                guards: {} as
                    | { type: "hasExercisesInCategory"; hasExercises: boolean }
                    | { type: "hasNoExercisesInCategory"; hasExercises: boolean }
                    | { type: "isSelectionEmpty"; selection: Exercise[] }
                    | { type: "hasNotSelectedExercises" },
            },
            id: "programForm",
            initial: "initial",
            context: {
                categoryId: undefined,
                exerciseList: [],
                prevState: undefined,
                stack: [{ categoryId: undefined, exerciseList: [], prevState: undefined }],
            },
            states: {
                initial: {
                    exit: "pushHistoryStack",
                    on: { StartCreatingProgram: { target: "creating.selectingCategory" } },
                    meta: { path: "/" },
                },
                creating: {
                    id: "creating",
                    initial: "selectingCategory",
                    states: {
                        selectingCategory: {
                            exit: "pushHistoryStack",
                            meta: { path: "/creating/selecting-category" },
                            on: {
                                GoBack: { target: "#programForm.initial", actions: "popHistoryStack" },
                                SelectCategory: [
                                    {
                                        target: "maybeCreatingExercise.shouldCreateChoice",
                                        actions: "assignCategory",
                                        cond: "hasExercisesInCategory",
                                    },
                                    { target: "maybeCreatingExercise.creatingExercise", actions: "assignCategory" },
                                ],
                            },
                        },
                        maybeCreatingExercise: {
                            initial: "shouldCreateChoice",
                            states: {
                                shouldCreateChoice: {
                                    exit: "pushHistoryStack",
                                    meta: { path: "/creating/select-or-create" },
                                    on: {
                                        GoBack: { target: "#creating.selectingCategory", actions: "popHistoryStack" },
                                        GoToCreateExercise: { target: "creatingExercise" },
                                        GoToSelectExercises: [
                                            {
                                                target: "#creating.selectingExercises.emptySelection",
                                                cond: "hasNotSelectedExercises",
                                            },
                                            {
                                                target: "#creating.selectingExercises.hasSelection",
                                            },
                                        ],
                                    },
                                },
                                creatingExercise: {
                                    exit: "pushHistoryStack",
                                    meta: { path: "/creating/exercise" },
                                    on: {
                                        GoBack: { target: "#creating.selectingCategory", actions: "popHistoryStack" },
                                        CreateExercise: {
                                            target: "#creating.maybeCreatingExercise.shouldCreateChoice",
                                            actions: "createExercise",
                                        },
                                    },
                                },
                            },
                            on: {
                                SelectCategory: [
                                    {
                                        target: "maybeCreatingExercise.shouldCreateChoice",
                                        actions: "assignCategory",
                                        cond: "hasExercisesInCategory",
                                    },
                                    { target: "maybeCreatingExercise.creatingExercise", actions: "assignCategory" },
                                ],
                            },
                        },
                        selectingExercises: {
                            initial: "emptySelection",
                            exit: "pushHistoryStack",
                            meta: { path: "/creating/selecting-exercise" },
                            states: {
                                emptySelection: {
                                    on: {
                                        UpdateSelection: { target: "hasSelection", actions: "updateSelection" },
                                    },
                                },
                                hasSelection: {
                                    on: {
                                        UpdateSelection: [
                                            {
                                                target: "emptySelection",
                                                actions: "updateSelection",
                                                cond: "isSelectionEmpty",
                                            },
                                            { actions: "updateSelection" },
                                        ],
                                        GoToProgramSettings: { target: "#creating.editSettings.initial" },
                                    },
                                },
                            },
                            on: {
                                GoBack: {
                                    target: "#creating.maybeCreatingExercise.shouldCreateChoice",
                                    actions: "popHistoryStack",
                                },
                                SelectCategory: { actions: ["assignCategory", "filterExercisesWithPrevCategory"] },
                            },
                        },
                        editSettings: {
                            initial: "initial",
                            exit: "pushHistoryStack",
                            meta: { path: "/creating/editing-settings" },
                            states: {
                                initial: {
                                    on: { StartEditingExerciseList: { target: "editingExerciseList" } },
                                },
                                editingExerciseList: {
                                    on: {
                                        AddExercise: { actions: "selectExercise" },
                                        CancelEditing: { target: "initial" },
                                        ConfirmEditing: { target: "initial", actions: "updateSelection" },
                                    },
                                },
                            },
                            on: {
                                GoBack: {
                                    target: "#creating.selectingExercises.hasSelection",
                                    actions: "popHistoryStack",
                                },
                                UnselectExercise: { actions: "unselectExercise" },
                                Submit: { target: "#programForm.done", actions: "assignProgramName" },
                                SelectCategory: [
                                    {
                                        target: "maybeCreatingExercise.creatingExercise",
                                        actions: ["assignCategory", "filterExercisesWithPrevCategory"],
                                        cond: "hasNoExercisesInCategory",
                                    },
                                    { actions: "assignCategory" },
                                ],
                            },
                        },
                    },
                },
                done: {
                    meta: { path: "/creating/done" },
                    type: "final",
                },
            },
        },
        {
            actions: {
                assignCategory: assign({ categoryId: (_ctx, e) => e.categoryId }),
                filterExercisesWithPrevCategory: assign({
                    exerciseList: (ctx, e) => ctx.exerciseList.filter((ex) => ex.category === e.categoryId),
                }),
                createExercise: assign({ exerciseList: (ctx, e) => ctx.exerciseList.concat(e.exercise) }),
                updateSelection: assign({ exerciseList: (_ctx, e) => e.selection }),
                unselectExercise: assign({
                    exerciseList: (ctx, e) => ctx.exerciseList.filter((exo) => exo.id !== e.exerciseId),
                }),
                selectExercise: assign({
                    exerciseList: (ctx, e) => ctx.exerciseList.concat(e.exercise),
                }),
                assignProgramName: assign({ categoryId: (_ctx, e) => e.programName }),
                pushHistoryStack: assign({
                    stack: (ctx) => [...ctx.stack, omit(ctx, ["stack"])],
                    prevState: (_ctx, _e, meta) => (meta.state ? getStatesPathValue(meta.state)[0] : "initial"),
                }),
                popHistoryStack: assign((ctx) => {
                    const prev = ctx.stack[ctx.stack.length - 1];
                    const stack = ctx.stack.slice(0, ctx.stack.length - 1);
                    // console.log(ctx.stack.length, stack.length);
                    return { ...prev, stack };
                }),
            },
            guards: {
                hasExercisesInCategory: (_ctx, event) => event.hasExercises,
                hasNoExercisesInCategory: (_ctx, event) => !event.hasExercises,
                isSelectionEmpty: (_ctx, event) => !event.selection.length,
                hasNotSelectedExercises: (ctx) => !ctx.exerciseList.length,
            },
        }
    );
