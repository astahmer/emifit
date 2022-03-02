import { createContextWithHook } from "@/functions/createContextWithHook";
import { InterpreterFrom } from "xstate";
import { programFormMachine } from "./programFormMachine";

export const [ProgramInterpretProvider, useProgramInterpret] =
    createContextWithHook<InterpreterFrom<typeof programFormMachine>>("ProgramInterpretContext");
