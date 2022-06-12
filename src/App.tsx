import { ChakraProvider } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { Provider } from "jotai";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { DailyEntry } from "./Daily/DailyEntry";
import { makeDb } from "./orm";
import { ExerciseAddPage } from "./pages/ExerciseAddPage";
import { ExerciseEditPage } from "./pages/ExerciseEditPage";
import { HomePage, HomePageLayout } from "./pages/HomePage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import ReloadPrompt from "./ReloadPrompt";
import { routeMap } from "./routes";
import { browserHistory, store } from "./store";
import { ClickToComponent } from "click-to-react-component";
import "./App.css";
import { ExerciseSupersetEditPage } from "./pages/ExerciseSupersetEditPage";
import { ExercisePageLayout } from "./pages/ExercisePageLayout";
import { appTheme } from "./theme";
import { Layout } from "./Layout";
import { ExerciseLibraryPage } from "./pages/ExerciseLibraryPage";

const queryClient = new QueryClient();

function App() {
    return (
        <DbProvider>
            <Provider unstable_createStore={() => store}>
                <QueryClientProvider client={queryClient}>
                    <ChakraProvider theme={appTheme}>
                        <HistoryRouter history={browserHistory}>
                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<HomePage />} />
                                    <Route path="daily" element={<HomePageLayout />}>
                                        <Route index element={<DailyEntry />} />
                                        <Route path="entry/:dailyId" element={<DailyEntry />} />
                                    </Route>
                                    <Route path="daily/entry/:dailyId/exercise" element={<ExercisePageLayout />}>
                                        <Route path="add" element={<ExerciseAddPage />} />
                                        <Route path="edit/:exoId" element={<ExerciseEditPage />} />
                                        <Route
                                            path="superset/edit/:supersetId"
                                            element={<ExerciseSupersetEditPage />}
                                        />
                                        <Route path="select" element={<ExerciseAddPage />} />
                                    </Route>
                                    <Route path={routeMap.progress} element={<ProgressPage />} />
                                    <Route path={routeMap.settings} element={<SettingsPage />} />
                                    <Route path={routeMap.programs} element={<ProgramsPage />} />
                                    <Route path={routeMap.exerciseLibrary} element={<ExerciseLibraryPage />} />
                                </Route>
                            </Routes>
                            <ReloadPrompt />
                            <ClickToComponent />
                        </HistoryRouter>
                    </ChakraProvider>
                </QueryClientProvider>
            </Provider>
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
