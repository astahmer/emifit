import { ChakraProvider } from "@chakra-ui/react";
import { WithChildren } from "pastable";
import { Provider } from "jotai";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { DailyEntry } from "./Daily/DailyEntry";
import { makeDb } from "./orm";
import { DailyExerciseAddPage } from "./pages/DailyExerciseAddPage";
import { DailyExerciseEditPage } from "./pages/DailyExerciseEditPage";
import { DailyPage, DailyPageLayout } from "./pages/DailyPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import ReloadPrompt from "./ReloadPrompt";
import { routeMap } from "./routes";
import { browserHistory, store } from "./store";
import { ClickToComponent } from "click-to-react-component";
import "./App.css";
import { DailyExerciseSupersetEditPage } from "./pages/DailyExerciseSupersetEditPage";
import { DailyExercisePageLayout } from "./Daily/DailyExercisePageLayout";
import { appTheme } from "./theme";
import { Layout } from "./Layout";
import { ExerciseLibraryPage } from "./pages/ExerciseLibraryPage";
import { DailyExerciseCopyPage } from "./pages/DailyExerciseCopyPage";
import { CompareTab } from "./Progress/CompareTab";
import { ProgressTab } from "./Progress/ProgressTab";
import { InspectTab } from "./Progress/InspectTab";
import { InspectExerciseTab } from "./Progress/InspectExerciseTab";
import { ExercisePageLayout } from "./Exercises/ExercisePageLayout";
import { ExerciseEditPage } from "./pages/ExerciseEditPage";
import { ExerciseSupersetEditPage } from "./pages/ExerciseSupersetEditPage";

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
                                    <Route index element={<DailyPage />} />
                                    <Route path="daily" element={<DailyPageLayout />}>
                                        <Route index element={<DailyEntry />} />
                                        <Route path="entry/:dailyId" element={<DailyEntry />} />
                                    </Route>
                                    <Route path="daily/entry/:dailyId/exercise" element={<DailyExercisePageLayout />}>
                                        <Route path="add" element={<DailyExerciseAddPage />} />
                                        <Route path="edit/:exoId" element={<DailyExerciseEditPage />} />
                                        <Route path="copy" element={<DailyExerciseCopyPage />} />
                                        <Route
                                            path="superset/edit/:supersetId"
                                            element={<DailyExerciseSupersetEditPage />}
                                        />
                                    </Route>
                                    <Route path="exercise" element={<ExercisePageLayout />}>
                                        <Route path="edit/:exoId" element={<ExerciseEditPage />} />
                                        <Route
                                            path="superset/edit/:supersetId"
                                            element={<ExerciseSupersetEditPage />}
                                        />
                                    </Route>
                                    <Route path={routeMap.progress} element={<ProgressPage />}>
                                        <Route index element={<ProgressTab />} />
                                        <Route path="inspect" element={<InspectTab />} />
                                        <Route path="compare" element={<CompareTab />} />
                                    </Route>
                                    <Route
                                        path={routeMap.progress + "/inspect/:exoSlug"}
                                        element={<InspectExerciseTab />}
                                    />
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
