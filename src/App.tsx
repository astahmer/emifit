import "./App.css";

import { ChakraProvider, Flex, extendTheme, Box } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BottomTabs } from "./components/BottomTabs";
import { HomePage } from "./pages/HomePage";
import { ProgressPage } from "./pages/ProgressPage";
import { AddPage } from "./pages/AddPage";
import { CalendarDefaultTheme } from "@uselessdev/datepicker";

const queryClient = new QueryClient();
const theme = extendTheme(CalendarDefaultTheme, { config: { initialColorMode: "light" } });

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <BrowserRouter>
                    <Flex direction="column" boxSize="100%">
                        <Flex direction="column" h="100%" overflow="hidden">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/add" element={<AddPage />} />
                                <Route path="/progress" element={<ProgressPage />} />
                            </Routes>
                        </Flex>
                        <Box mt="auto" w="100%" flexShrink="0">
                            <BottomTabs />
                        </Box>
                    </Flex>
                </BrowserRouter>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

export default App;
