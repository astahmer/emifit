import { serializeExercise } from "@/functions/snapshot";
import { onError, successToast } from "@/functions/toasts";
import { makeId, rmTrailingSlash } from "@/functions/utils";
import { mergeMeta, printStatesPathValue } from "@/functions/xstate-utils";
import { orm } from "@/orm";
import { ProgramInterpretProvider } from "@/Programs/useProgramInterpret";
import { browserHistory, debugModeAtom, useProgramQuery } from "@/store";
import { Box, Heading, Tag } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import confetti from "canvas-confetti";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { InitialState } from "../Programs/InitialState";
import { ProgramForm } from "../Programs/ProgramForm";
import { programFormMachine } from "../Programs/programFormMachine";

export const ProgramsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const query = useProgramQuery();
    const programList = query.data;

    const mutation = useMutation(
        async (ctx: typeof programFormMachine["context"]) => {
            const currentProgram = ctx.programId ? programList.find((p) => p.id === ctx.programId) : null;
            const isEditing = Boolean(currentProgram);

            navigate("/");
            confetti();
            successToast(`Program <${ctx.programName}> ${isEditing ? "updated" : "created"}`);

            const tx = orm.exercise.tx("readwrite");
            const newExos = ctx.exerciseList.map((exo) => ({ ...exo, id: makeId(), madeFromExerciseId: exo.id }));
            const insertMany = newExos.map((exo) => tx.store.add(serializeExercise(exo)));

            const params = {
                ...currentProgram,
                name: ctx.programName,
                category: ctx.categoryId,
                exerciseList: newExos.map((exo) => exo.id),
            };
            const now = new Date();
            if (params.id) {
                return Promise.all([...insertMany, orm.program.update({ ...params, updatedAt: now }), tx.done]);
            }

            return Promise.all([
                ...insertMany,
                orm.program.update({ ...params, id: makeId(), createdAt: now, updatedAt: now }),
                tx.done,
            ]);
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(orm.program.name);
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
                <Heading as="h1">Programs</Heading>
                {query.isFetched && (
                    <>
                        {state.matches("initial") && <InitialState />}
                        {state.matches("creating") && <ProgramForm />}
                    </>
                )}
            </Box>
            {debugMode && (
                <Box position="fixed" top="10px" w="100%" textAlign="center">
                    <Tag wordBreak="break-all">{printStatesPathValue(state)}</Tag>
                </Box>
            )}
        </ProgramInterpretProvider>
    );
};
