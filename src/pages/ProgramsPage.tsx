import { mergeMeta, printStatesPathValue } from "@/functions/xstate-utils";
import { ProgramInterpretProvider } from "@/Programs/useProgramInterpret";
import { Box, Tag } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { programFormMachine } from "../Programs/programFormMachine";
import { CreateProgramForm } from "../Programs/CreateProgramForm";
import { InitialState } from "../Programs/InitialState";

export const ProgramsPage = () => {
    const [state, _send, interpret] = useMachine(programFormMachine);
    const navigate = useNavigate();
    const meta = mergeMeta(state.meta as { path?: string });
    console.log(state.context);

    // TODO from machine ?
    const toPathRef = useRef<string>("/programs");
    // Update location.pathname when state changes
    useEffect(() => {
        if (!meta.path?.length) return;
        const toWithMaybeTrailingSlash = "/programs" + meta.path;
        const to = toWithMaybeTrailingSlash.endsWith("/")
            ? toWithMaybeTrailingSlash.slice(0, toWithMaybeTrailingSlash.length - 1)
            : toWithMaybeTrailingSlash;

        if (toPathRef.current === to) return;
        // console.log("GoTo", { from: toPathRef.current, to }, state.context.prevState);
        navigate(to);
        toPathRef.current = to;
    }, [meta.path]);

    const location = useLocation();
    // Handle back button, sync url to state = go back to previous state
    useEffect(() => {
        if (toPathRef.current !== location.pathname) {
            interpret.send({ type: "GoBack" });
            // console.log("GoBack", { from: toPathRef.current, to: location.pathname }, state.context.prevState);
            toPathRef.current = location.pathname;
        }
    }, [location.pathname]);

    return (
        <ProgramInterpretProvider value={interpret}>
            <Box id="ProgramsPage" d="flex" h="100%" p="4" w="100%">
                {state.matches("initial") && <InitialState />}
                {state.matches("creating") && <CreateProgramForm />}
            </Box>
            <Box position="fixed" top="10px" w="100%" textAlign="center">
                <Tag wordBreak="break-all">{printStatesPathValue(state)}</Tag>
            </Box>
        </ProgramInterpretProvider>
    );
};
