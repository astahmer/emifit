import { SwitchInput } from "@/fields/SwitchInput";
import { FooterSpacer, ViewLayout } from "@/Layout";
import { useCategoryList, useDailyList, useExerciseList, useGroupList, useProgramList, useTagList } from "@/orm-hooks";
import { DataAccordions } from "@/Settings/DataAccordions";
import { debugModeAtom } from "@/store";
import { Box, chakra, Flex, Heading, Stack } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { ExportImportData } from "../Settings/ExportImportData";

export const SettingsPage = () => {
    const [debugMode, setDebugMode] = useAtom(debugModeAtom);

    return (
        <ViewLayout>
            <ViewLayout id="SettingsPage" h="100%" p="4" w="100%">
                <Flex>
                    <Heading as="h1">Settings</Heading>
                    <chakra.span ml="auto">
                        EmiFIT v{import.meta.env.VITE_APP_VERSION} [{import.meta.env.DEV ? "dev" : "prod"}]
                    </chakra.span>
                </Flex>
                <Flex flexDirection="column" mt="8" h="100%" minH="0" overflow="auto">
                    {/* TODO theme colors */}
                    <EditableList />
                    <Box mt="auto">
                        <Stack spacing="4" mt="8" pt="8">
                            <ExportImportData />
                            <Flex>
                                <SwitchInput
                                    ml="auto"
                                    id="debugModeSwitch"
                                    label="Debug mode"
                                    onChange={(e) => setDebugMode(e.target.checked)}
                                    isChecked={debugMode}
                                />
                            </Flex>
                        </Stack>
                    </Box>
                    {debugMode && (
                        <Box mt="4">
                            <DebugModeOnly />
                        </Box>
                    )}
                </Flex>
            </ViewLayout>
            <FooterSpacer />
        </ViewLayout>
    );
};

const DebugModeOnly = () => {
    const programList = useProgramList();
    const dailyList = useDailyList();

    return <DataAccordions programList={programList} dailyList={dailyList} showIdColumn />;
};

const EditableList = () => {
    const tagList = useTagList();
    const categoryList = useCategoryList();
    const groupList = useGroupList();
    const isDebugMode = useAtomValue(debugModeAtom);
    const exerciseList = useExerciseList();

    return (
        <DataAccordions
            tagList={tagList}
            categoryList={categoryList}
            groupList={groupList}
            exerciseList={exerciseList}
            showIdColumn={isDebugMode}
            withActions
        />
    );
};
