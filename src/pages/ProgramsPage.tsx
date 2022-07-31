import { SortByDirection, SortByIconButton } from "@/components/SortByIconButton";
import { serializeExercise } from "@/functions/snapshot";
import { onError, successToast } from "@/functions/toasts";
import { makeId, rmTrailingSlash } from "@/functions/utils";
import { mergeMeta, printStatesPathValue } from "@/functions/xstate-utils";
import { orm } from "@/orm";
import { useProgramQuery } from "@/orm-hooks";
import { ProgramInterpretProvider } from "@/Programs/useProgramInterpret";
import { routeMap } from "@/routes";
import { browserHistory, debugModeAtom } from "@/store";
import { Box, Flex, Heading, Tag } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import confetti from "canvas-confetti";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { InitialState } from "../Programs/InitialState";
import { ProgramForm } from "../Programs/ProgramForm";
import { programFormMachine } from "../Programs/programFormMachine";
import { Exercise } from "@/orm-types";
import { FooterSpacer, ViewLayout } from "@/Layout";

export const ProgramsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const query = useProgramQuery();
    const programList = query.data;

    const mutation = useMutation(
        async (ctx: typeof programFormMachine["context"]) => {
            const currentProgram = ctx.programId ? programList.find((p) => p.id === ctx.programId) : null;

            const tx = orm.exercise.tx("readwrite");
            const programId = currentProgram?.id || makeId();
            const newExos = ctx.exerciseList.map((exo) => ({
                ...exo,
                id: makeId(),
                madeFromExerciseId: exo.id,
                programId,
                from: "program",
            })) as Exercise[];
            const insertMany = newExos.map((exo) => tx.store.add(serializeExercise(exo)));

            const params = {
                ...currentProgram,
                name: ctx.programName,
                category: ctx.categoryId,
                exerciseList: newExos.map((exo) => exo.id),
            };
            const now = new Date();
            if (params.id) {
                return Promise.all([...insertMany, orm.program.put({ ...params, updatedAt: now }), tx.done]);
            }

            return Promise.all([
                ...insertMany,
                orm.program.put({ ...params, id: programId, createdAt: now, updatedAt: now }),
                tx.done,
            ]);
        },
        {
            onSuccess: (_data, ctx) => {
                const currentProgram = ctx.programId ? programList.find((p) => p.id === ctx.programId) : null;
                const isEditing = Boolean(currentProgram);

                navigate(routeMap.home);
                confetti();
                successToast(`Program <${ctx.programName}> ${isEditing ? "updated" : "created"}`);
                queryClient.invalidateQueries([orm.program.name]);
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

    // TODO update search param instead of path ?
    const toPathRef = useRef<string>("/programs");
    // TOOD console.log(useNavigationType()) ?

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
    const [sortByDirection, setSortByDirection] = useState<SortByDirection>("asc");

    return (
        <ViewLayout>
            <ProgramInterpretProvider value={interpret}>
                <ViewLayout id="ProgramsPage" h="100%" p="4" w="100%">
                    <Flex alignItems="center">
                        <Heading as="h1">Programs</Heading>
                        {state.matches("initial") && (
                            <SortByIconButton
                                ml="auto"
                                variant="outline"
                                sortByDirection={sortByDirection}
                                onSortByDirectionChange={setSortByDirection}
                            />
                        )}
                    </Flex>
                    {query.isFetched && (
                        <>
                            {state.matches("initial") && <InitialState sortByDirection={sortByDirection} />}
                            {state.matches("creating") && <ProgramForm />}
                        </>
                    )}
                </ViewLayout>
                {debugMode && (
                    <Box position="fixed" top="10px" w="100%" textAlign="center">
                        <Tag wordBreak="break-all">{printStatesPathValue(state)}</Tag>
                    </Box>
                )}
            </ProgramInterpretProvider>
            <FooterSpacer />
        </ViewLayout>
    );
};
