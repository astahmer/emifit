import { mergeMeta, printStatesPathValue } from "@/functions/xstate-utils";
import { ProgramInterpretProvider } from "@/Programs/useProgramInterpret";
import { Box, Heading, Tag } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { programFormMachine } from "../Programs/programFormMachine";
import { CreateProgramForm } from "../Programs/CreateProgramForm";
import { InitialState } from "../Programs/InitialState";
import { browserHistory, debugModeAtom, makeProgram, persistProgram } from "@/store";
import confetti from "canvas-confetti";
import { onError, successToast } from "@/functions/toasts";
import { rmTrailingSlash } from "@/functions/utils";
import { useAtomValue } from "jotai";
import { useMutation, useQueryClient } from "react-query";

export const ProgramsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const mutation = useMutation(
        async (ctx: typeof programFormMachine["context"]) => {
            navigate("/");
            confetti();
            successToast(`Program <${ctx.programName}> created`);

            persistProgram(
                makeProgram({
                    name: ctx.programName,
                    category: ctx.categoryId,
                    exercises: ctx.exerciseList,
                })
            );
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries("programList");
            },
            onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
        }
    );

    const [state, _send, interpret] = useMachine(programFormMachine, {
        actions: {
            onDone: (ctx) => void mutation.mutate(ctx),
            navigateTo: (_ctx, e, actionMeta) => {
                const meta = mergeMeta(actionMeta.state.meta as { path?: string });
                if (!meta.path) return;

                const to = rmTrailingSlash("/programs" + meta.path);
                if (toPathRef.current === to) return;

                navigate(to, { state: interpret.getSnapshot().context });
                toPathRef.current = to;
            },
        },
    });

    const toPathRef = useRef<string>("/programs");

    // Handle back button, sync url to state = go back to previous state
    useEffect(() => {
        return browserHistory.listen((update) => {
            if (update.action === "POP") {
                toPathRef.current = rmTrailingSlash(update.location.pathname);
                interpret.send({ type: "GoBack" });
            }
        });
    }, []);

    const debugMode = useAtomValue(debugModeAtom);

    return (
        <ProgramInterpretProvider value={interpret}>
            <Box id="ProgramsPage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
                <Heading as="h1">Programs list</Heading>
                {state.matches("initial") && <InitialState />}
                {state.matches("creating") && <CreateProgramForm />}
            </Box>
            {debugMode && (
                <Box position="fixed" top="10px" w="100%" textAlign="center">
                    <Tag wordBreak="break-all">{printStatesPathValue(state)}</Tag>
                </Box>
            )}
        </ProgramInterpretProvider>
    );
};
