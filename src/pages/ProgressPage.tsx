import { VFlex } from "@/components/VFlex";
import { FooterSpacer, ViewLayout } from "@/Layout";
import { Tab, TabList, Tabs } from "@chakra-ui/react";
import { Outlet, Link as ReactLink, useLocation } from "react-router-dom";
import { match } from "ts-pattern";

export const ProgressPage = () => {
    const location = useLocation();
    const index = getDefaultTabIndex(location.pathname);

    return (
        <ViewLayout>
            <ViewLayout id="ProgressPage">
                <Tabs
                    variant="soft-rounded"
                    display="flex"
                    flexDirection="column"
                    maxH="100%"
                    w="100%"
                    flexGrow={1}
                    index={index}
                >
                    <VFlex pos="relative" h="100%" minH={0}>
                        <VFlex h="100%" minH={0} overflowX="hidden" overflowY="auto" p="4">
                            <Outlet />
                        </VFlex>
                    </VFlex>

                    <TabList mt="auto" p="4" flexShrink={0} minH={0} alignSelf="center">
                        {/* global stats overview */}
                        <Tab as={ReactLink} to="">
                            Progress
                        </Tab>
                        {/* TODO inspect 1 specific exo (stats table, graph, etc (?)) */}
                        <Tab as={ReactLink} to="inspect">
                            Inspect
                        </Tab>
                        {/* compare 1 exo with another (or multiple ?) */}
                        <Tab as={ReactLink} to="compare">
                            Compare
                        </Tab>
                    </TabList>
                </Tabs>
            </ViewLayout>
            <FooterSpacer />
        </ViewLayout>
    );
};

const getDefaultTabIndex = (pathname: string) =>
    match(pathname)
        .with("/progress", () => 0)
        .with("/progress/inspect", () => 1)
        .with("/progress/compare", () => 2)
        .otherwise(() => -1);
