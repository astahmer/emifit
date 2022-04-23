import { Box, ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";
import { Provider, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Outlet, Route, Routes, unstable_HistoryRouter as HistoryRouter, useNavigate } from "react-router-dom";
import "./App.css";
import { BottomTabs } from "./components/BottomTabs";
import { DailyEntry } from "./Daily/DailyEntry";
import { ExerciseGridView } from "./Daily/ExerciseGridView";
import { ExerciseListView } from "./Daily/ExerciseListView";
import { DevTools } from "./DevTools";
import { makeDb } from "./orm";
import { ExerciseAddPage } from "./pages/ExerciseAddPage";
import { ExerciseEditPage } from "./pages/ExerciseEditPage";
import { HomePage, HomePageLayout } from "./pages/HomePage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { routeMap } from "./routes";
import { debugModeAtom, browserHistory, store } from "./store";

const queryClient = new QueryClient();
const theme = extendTheme(CalendarDefaultTheme, { config: { initialColorMode: "light" } });

function App() {
    const setDebugMode = useSetAtom(debugModeAtom);
    useHotkeys("cmd+k", () => setDebugMode((current) => !current));

    return (
        <DbProvider>
            <Provider unstable_createStore={() => store}>
                <QueryClientProvider client={queryClient}>
                    <ChakraProvider theme={theme}>
                        <HistoryRouter history={browserHistory}>
                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<HomePage />} />
                                    <Route path="daily" element={<HomePageLayout />}>
                                        <Route index element={<DailyEntry />} />
                                        <Route path="entry/:dailyId" element={<DailyEntry />} />
                                        <Route path="list" element={<ExerciseListView />} />
                                    </Route>
                                    <Route path="exercise/grid" element={<ExerciseGridView />} />
                                    <Route path={routeMap.exercise.add} element={<ExerciseAddPage />} />
                                    <Route path={routeMap.exercise.edit} element={<ExerciseEditPage />} />
                                    <Route path={routeMap.progress} element={<ProgressPage />} />
                                    <Route path={routeMap.settings} element={<SettingsPage />} />
                                    <Route path={routeMap.programs} element={<ProgramsPage />} />
                                </Route>
                            </Routes>
                        </HistoryRouter>
                    </ChakraProvider>
                </QueryClientProvider>
            </Provider>
        </DbProvider>
    );
}

const Layout = () => {
    return (
        <Flex as="main" direction="column" boxSize="100%">
            <Flex as="section" id="View" direction="column" h="100%" overflow="hidden">
                <Outlet />
            </Flex>
            <Box as="footer" mt="auto" w="100%" flexShrink={0}>
                <BottomTabs />
            </Box>
            <Box pos="fixed" bottom="70px">
                <ReactQueryDevtools toggleButtonProps={{ style: { position: "absolute" } }} />
            </Box>
            <DevTools />
        </Flex>
    );
};

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
