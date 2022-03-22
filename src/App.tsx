import { Box, ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";
import { useAtomValue, useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import "./App.css";
import { BottomTabs } from "./components/BottomTabs";
import { SwitchInput } from "./components/SwitchInput";
import { ExerciseAddPage } from "./pages/ExerciseAddPage";
import { HomePage } from "./pages/HomePage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { debugModeAtom, browserHistory, showSkeletonsAtom } from "./store";

const queryClient = new QueryClient();
const theme = extendTheme(CalendarDefaultTheme, { config: { initialColorMode: "light" } });

function App() {
    const setDebugMode = useSetAtom(debugModeAtom);
    useHotkeys("cmd+k", () => setDebugMode((current) => !current));

    return (
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
                        <Box as="footer" mt="auto" w="100%" flexShrink="0">
                            <BottomTabs />
                        </Box>
                        <DevTools />
                    </Flex>
                </HistoryRouter>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

const DevTools = () => {
    const debugMode = useAtomValue(debugModeAtom);
    const setShowSkeletons = useSetAtom(showSkeletonsAtom);

    if (!debugMode) return null;

    return (
        <Box
            as="footer"
            mt="auto"
            w="100%"
            flexShrink="0"
            position="fixed"
            bottom="0"
            left="0"
            right="0"
            bg="gray.200"
            p="4"
            borderTop="1px solid"
            borderColor="gray.300"
        >
            <Box as="pre" color="gray.700" fontSize="sm">
                <SwitchInput label="With skeletons" onChange={(e) => setShowSkeletons(e.target.checked)} />
            </Box>
        </Box>
    );
};

export default App;
