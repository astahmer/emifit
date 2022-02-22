import { createMachine } from "xstate";

export const programFormMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7KqCGBbAYuqrgHRi7IAuAngMQDKl2qlAwqmNpQJYB2UABQxY8iFOljce6XmJAAPRAEYATCpIAWAKwBOJQGYAbDsMqAHDoAMpgDQhqiQ2ZIrDGy5YDsWp-t36zAF9AuzRMHAIiUgBjDi4+KBIAdykAC3QAVzYuMCgiOnowABswaOzKXPy5ZAkpbhk5RQQVJUsSb08dHR9LLQ0nbzsHBH0uki1zS30VDW0lbp1g0OEIwmISWM4efg2cvNRqQpKyyAZi0soAUXkwVGjuWDhq2ulZJAVELVaXDVadbxaGlcXiGiFGOnGk2msy+C2CIRAvHQECe7zCIki63IVGG4kkr0aiCBoIQZiUJEM00sqg0AV+ZlcSxA6NWUQ2cW2iRSlHSWVYeyqaJe9TeoCaOhUJN+6gshimnn0SgmfSCCJZeDWMQ5CV2FX2h3OJwgz3xIsJIzMnhIFjMuktQNUEqlqmtJnliuVGlVy3CGrZm3iO0ex0511u90e8CFpoa7yaA2thkMSlaKm8lncZmdMrd+gVSpUKqZ6sxWq2CRNdVjYscWfsYNckLMXgmcqshY0xZWfuIlYJceUdeGAFoNO0jB5DFovp4lO5PJ54YEgA */
    createMachine({
        tsTypes: {} as import("./programFormMachine.typegen").Typegen0,
        schema: {
            context: {} as { categoryId: string; exerciseIds: string[] },
            events: {} as
                | { type: "StartCreatingProgram" }
                | { type: "SelectCategory"; value: string }
                | { type: "SelectExercises"; value: string[] },
        },
        id: "programForm",
        initial: "initial",
        states: {
            initial: {
                on: {
                    StartCreatingProgram: {
                        target: "#programForm.creating.withoutCategory",
                    },
                },
            },
            creating: {
                states: {
                    withoutCategory: {
                        on: {
                            SelectCategory: {
                                target: "#programForm.creating.categorySelected",
                            },
                        },
                    },
                    categorySelected: {
                        on: {
                            SelectExercises: {
                                target: "#programForm.creating.selectingExercises",
                            },
                        },
                    },
                    selectingExercises: {},
                },
            },
        },
    });
