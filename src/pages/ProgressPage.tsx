import { InspectTab } from "@/Progress/InspectTab";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { ProgressTab } from "../Progress/ProgressTab";

export const ProgressPage = () => {
    return (
        <Tabs
            variant="soft-rounded"
            id="ProgressPage"
            d="flex"
            flexDirection="column"
            maxH="100%"
            w="100%"
            flexGrow={1}
        >
            <TabPanels h="100%" minH={0} overflowX="hidden" overflowY="auto">
                <TabPanel>
                    <ProgressTab />
                </TabPanel>
                <TabPanel>
                    <InspectTab />
                </TabPanel>
                <TabPanel>Inspect</TabPanel>
            </TabPanels>
            <TabList mt="auto" p="4" flexShrink={0} minH={0} alignSelf="center">
                {/* global stats overview */}
                <Tab>Progress</Tab>
                {/* TODO inspect 1 specific exo (stats table, graph, etc (?)) */}
                <Tab>Inspect</Tab>
                {/* compare 1 exo with another (or multiple ?) */}
                <Tab>Compare</Tab>
            </TabList>
        </Tabs>
    );
};
