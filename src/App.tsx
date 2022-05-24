import { Box, ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";
import { Provider, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useHotkeys } from "react-hotkeys-hook";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Outlet, Route, Routes, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { BottomTabs } from "./components/BottomTabs";
import { DailyEntry } from "./Daily/DailyEntry";
import { DevTools } from "./DevTools";
import { ErrorFallback } from "./components/ErrorFallback";
import { makeDb } from "./orm";
import { ExerciseAddPage } from "./pages/ExerciseAddPage";
import { ExerciseEditPage } from "./pages/ExerciseEditPage";
import { HomePage, HomePageLayout } from "./pages/HomePage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import ReloadPrompt from "./ReloadPrompt";
import { routeMap } from "./routes";
import { browserHistory, debugModeAtom, store } from "./store";
import "./App.css";

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
                                    </Route>
                                    {/* TODO ExoLayout et mettre en children ces 3 là */}
                                    <Route path="daily/entry/:dailyId/exercise/add" element={<ExerciseAddPage />} />
                                    <Route
                                        path="daily/entry/:dailyId/exercise/edit/:exoId"
                                        element={<ExerciseEditPage />}
                                    />
                                    <Route path="daily/entry/:dailyId/exercise/select" element={<ExerciseAddPage />} />
                                    <Route path={routeMap.progress} element={<ProgressPage />} />
                                    <Route path={routeMap.settings} element={<SettingsPage />} />
                                    <Route path={routeMap.programs} element={<ProgramsPage />} />
                                </Route>
                            </Routes>
                            <ReloadPrompt />
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
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Outlet />
                </ErrorBoundary>
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
