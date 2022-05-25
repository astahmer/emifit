import type { ExerciseFormValues } from "@/Exercises/CreateExerciseForm";
import { assign, ContextFrom, createMachine } from "xstate";

interface Context {
    exerciseCount: number;
    singleForm: ExerciseFormValues;
    supersetForms: Record<number, ExerciseFormValues>;
}

export const makeExerciseAddPageMachine = () =>
    createMachine(
        {
            id: "exerciseAddPage",
            schema: {
                context: {} as Context,
                events: {} as
                    | { type: "AddExercise" }
                    | { type: "RemoveExercise" }
                    | { type: "UpdateForm"; form: ExerciseFormValues }
                    | { type: "UpdateSupersetForm"; form: ExerciseFormValues; index: number },
            },
            tsTypes: {} as import("./exerciseAddPageMachine.typegen").Typegen0,
            context: { exerciseCount: 1, singleForm: {} as ExerciseFormValues, supersetForms: {} },
            initial: "single",
            states: {
                single: {
                    initial: "editing",
                    states: {
                        editing: {
                            on: {
                                UpdateForm: [
                                    { target: "canSubmit", actions: "updateForm", cond: "hasFilledSingleForm" },
                                    { actions: "updateForm" },
                                ],
                            },
                        },
                        canSubmit: {
                            on: {
                                UpdateForm: [
                                    { target: "editing", actions: "updateForm", cond: "hasNotFilledSingleForm" },
                                    { actions: "updateForm" },
                                ],
                            },
                        },
                    },
                    on: {
                        AddExercise: { target: "superset", actions: "addExercise" },
                    },
                },
                superset: {
                    initial: "editing",
                    states: {
                        editing: {
                            on: {
                                UpdateSupersetForm: [
                                    {
                                        target: "canSubmit",
                                        actions: "updateSupersetForm",
                                        cond: "hasAllSupersetFormFilled",
                                    },
                                    { actions: "updateSupersetForm" },
                                ],
                            },
                        },
                        canSubmit: {
                            on: {
                                UpdateSupersetForm: [
                                    {
                                        target: "editing",
                                        actions: "updateSupersetForm",
                                        cond: "hasNotAllSupersetFormFilled",
                                    },
                                    { actions: "updateSupersetForm" },
                                ],
                            },
                        },
                    },
                    on: {
                        AddExercise: { actions: "addExercise" },
                        RemoveExercise: { target: "single", actions: "removeExercise" },
                    },
                },
            },
        },
        {
            actions: {
                addExercise: assign({ exerciseCount: (ctx) => ctx.exerciseCount + 1 }),
                removeExercise: assign({ exerciseCount: (ctx) => ctx.exerciseCount - 1 }),
                updateForm: assign({
                    singleForm: (_ctx, event) => event.form,
                    supersetForms: (ctx, event) => ({ ...ctx.supersetForms, 0: event.form }),
                }),
                updateSupersetForm: assign({
                    singleForm: (ctx, event) => (event.index === 0 ? event.form : ctx.singleForm),
                    supersetForms: (ctx, event) => ({ ...ctx.supersetForms, [event.index]: event.form }),
                }),
            },
            guards: {
                hasFilledSingleForm,
                hasNotFilledSingleForm: (ctx) => !hasFilledSingleForm(ctx),
                hasAllSupersetFormFilled,
                hasNotAllSupersetFormFilled: (ctx) => !hasAllSupersetFormFilled(ctx),
            },
        }
    );

const hasFilledSingleForm = (ctx: Context) => Boolean(ctx.singleForm.name && ctx.singleForm.tags.length);
const hasAllSupersetFormFilled = (ctx: Context) => {
    console.log(ctx);
    const values = Object.values(ctx.supersetForms);
    if (!values.length) return false;
    if (ctx.exerciseCount !== values.length) return false;
    return values.every((form) => Boolean(form.name && form.tags.length));
};
