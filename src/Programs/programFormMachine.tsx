import { Exercise } from "@/store";
import { assign, createMachine } from "xstate";

export const programFormMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7KqCGBbAYuqrgHQCWAdmQC5nYA2AxAMrXarUDCqY2tFUAAoYseRCnSwaZdBXEgAHogCsAJgA0IAJ6IAzADYADCQCcZkwHYAHAEY1hk8uUAWAL6vNaTDgJFSAYx4+SigSWDB6MH9+KE4+MCgiLRYIqK54xNQdJBBkSWlZeSUEXUMLEmdDfVV9K2V9SzMLTWyLG2dTc30bWosTUv13TxEfQmISQN4YklxsLQAjMG4pkIBRBTBUfzJwsIALdABXeghl+M4Dsn8wRgBxdAAVdDPqMHXN7fD5PKlaQpzirprCR9PVVM4rKVVMpdJYWogbDZdKpOmZYbVdE5dENciM8GMAkFprMFksiWsNlsdmB9kcTi8lpdrndHuhmKlou8qeF4DkfgU5ADEFYaiRrDZVD0TKoDP1dPCEBKjBVzLKkc5nLUcV5RL5xpNggIZnNFi8KR9qRNyQIuZ8bgzbdTvvk-oLQMVnHYSEDlIYyoYNRYLPpnMoFTYqlZUSZQ6oZcHlBZtXi9YSVkbwpFoubuXAUlnqI6ec7fjI3YoEQ5dCQRYZdJVVCYyiYbFZw6pDCjnOZnLpkRCLAH3B4QBR0BA4N8UwTyFRaAwSwKiohnBptIgm9GrE3gwHrMnvPi-Fb06FM2kQnFXplshJS-93Ru160etGQ0CTFY-W4RzrRseDWJE0yVPIsaVgA5jlOIlGXQK4wEXV1l0VZFw0MWxo1DVtNWcCxlAPXUZ0AkJjVJM0bUpO0T0NKAwMQstkOUbcSHaKp6wjQcsLQr8az7VQ+lXSEbAI-99WtUISVNcS6L5F0GKFRV0IVMxlGjep2iDVsRKPMTTzCDkYjA3k7yXBSI09FjKkTKxrG3epnHbNoVTRIMrE1JjtNTaiYnoh8KwQWoFRDGxowsGpESsEUTE8glfPLYpW3DKxh1cIA */
    createMachine(
        {
            tsTypes: {} as import("./programFormMachine.typegen").Typegen0,
            schema: {
                context: {} as { categoryId: string; exerciseList: Exercise[] },
                events: {} as
                    | { type: "StartCreatingProgram" }
                    | { type: "SelectCategory"; categoryId: string; hasExercises: boolean }
                    | { type: "CreateExercise"; exercise: Exercise }
                    | { type: "GoToCreateExercise" }
                    | { type: "GoToSelectExercises" }
                    | { type: "PickExercise"; exercise: Exercise }
                    | { type: "GoToProgramSettings" }
                    | { type: "Submit" },
                guards: {} as { type: "hasExercises"; hasExercise: boolean },
            },
            id: "programForm",
            initial: "initial",
            context: { categoryId: undefined, exerciseList: [] },
            states: {
                initial: {
                    on: { StartCreatingProgram: { target: "creating" } },
                },
                creating: {
                    initial: "selectingCategory",
                    states: {
                        selectingCategory: {
                            on: {
                                SelectCategory: [
                                    {
                                        target: "maybeCreatingExercise.shouldCreateChoice",
                                        actions: "assignCategory",
                                        cond: "hasExercises",
                                    },
                                    { target: "maybeCreatingExercise.creatingExercise", actions: "assignCategory" },
                                ],
                            },
                        },
                        maybeCreatingExercise: {
                            initial: "shouldCreateChoice",
                            states: {
                                shouldCreateChoice: {
                                    on: {
                                        GoToCreateExercise: { target: "creatingExercise" },
                                        GoToSelectExercises: { target: "#programForm.creating.selectingExercises" },
                                    },
                                },
                                creatingExercise: {
                                    on: {
                                        CreateExercise: {
                                            target: "#programForm.creating.maybeCreatingExercise.shouldCreateChoice",
                                            actions: "createExercise",
                                        },
                                    },
                                },
                            },
                        },
                        selectingExercises: {
                            on: {
                                PickExercise: { actions: "addExercise" },
                                GoToProgramSettings: { target: "#programForm.creating.editSettings" },
                            },
                        },
                        editSettings: {
                            on: { Submit: { target: "#programForm.done" } },
                        },
                    },
                    on: {
                        SelectCategory: { actions: ["assignCategory", "filterExercisesWithPrevCategory"] },
                    },
                },
                done: {
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
                addExercise: assign({ exerciseList: (ctx, e) => ctx.exerciseList.concat(e.exercise) }),
            },
            guards: {
                hasExercises: (_ctx, event) => event.hasExercises,
            },
        }
    );
