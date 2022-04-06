import { Box, ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import "./App.css";
import { BottomTabs } from "./components/BottomTabs";
import { DevTools } from "./DevTools";
import { makeDb } from "./orm";
import { ExerciseAddPage } from "./pages/ExerciseAddPage";
import { HomePage } from "./pages/HomePage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { debugModeAtom, browserHistory } from "./store";

const queryClient = new QueryClient();
const theme = extendTheme(CalendarDefaultTheme, { config: { initialColorMode: "light" } });

function App() {
    const setDebugMode = useSetAtom(debugModeAtom);
    useHotkeys("cmd+k", () => setDebugMode((current) => !current));

    return (
        <DbProvider>
            <QueryClientProvider client={queryClient}>
                <ChakraProvider theme={theme}>
                    <HistoryRouter history={browserHistory}>
                        <Flex as="main" direction="column" boxSize="100%">
                            <Flex as="section" id="View" direction="column" h="100%" overflow="hidden">
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/exercise/add" element={<ExerciseAddPage />} />
                                    <Route path="/exercise/edit/:id" element={<ExerciseAddPage />} />
                                    <Route path="/progress" element={<ProgressPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/programs/*" element={<ProgramsPage />} />
                                </Routes>
                            </Flex>
                            <Box as="footer" mt="auto" w="100%" flexShrink={0}>
                                <BottomTabs />
                            </Box>
                            <Box pos="fixed" bottom="70px">
                                <ReactQueryDevtools toggleButtonProps={{ style: { position: "absolute" } }} />
                            </Box>
                            <DevTools />
                        </Flex>
                    </HistoryRouter>
                </ChakraProvider>
            </QueryClientProvider>
        </DbProvider>
    );
}

const DbProvider = (props: WithChildren) => {
    const [isDatabaseReady, setIsDatabaseReady] = useState(false);

    useEffect(() => {
        const connect = async () => {
            await makeDb();
            setIsDatabaseReady(true);
        };

        connect();
    }, []);

    return isDatabaseReady ? <>{props.children}</> : null;
};

export default App;
