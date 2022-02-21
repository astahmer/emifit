import "./App.css";

import { ChakraProvider, Flex, extendTheme, Box } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BottomTabs } from "./components/BottomTabs";
import { HomePage } from "./pages/HomePage";
import { ProgressPage } from "./pages/ProgressPage";
import { AddPage } from "./pages/AddPage";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";
import { ProgramsPage } from "./pages/ProgramsPage";

const queryClient = new QueryClient();
const theme = extendTheme(CalendarDefaultTheme, { config: { initialColorMode: "light" } });

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <BrowserRouter>
                    <Flex as="main" direction="column" boxSize="100%">
                        <Flex as="section" direction="column" h="100%" overflow="hidden">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/add" element={<AddPage />} />
                                <Route path="/progress" element={<ProgressPage />} />
                                <Route path="/programs" element={<ProgramsPage />} />
                            </Routes>
                        </Flex>
                        <Box as="footer" mt="auto" w="100%" flexShrink="0">
                            <BottomTabs />
                        </Box>
                    </Flex>
                </BrowserRouter>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

export default App;
