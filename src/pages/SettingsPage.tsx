import { SwitchInput } from "@/components/SwitchInput";
import { useCategoryList, useDailyList, useExerciseList, useGroupList, useProgramList, useTagList } from "@/orm-hooks";
import { DataAccordions } from "@/Settings/DataAccordions";
import { debugModeAtom } from "@/store";
import { Box, chakra, Flex, Heading, Stack } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { ExportImportData } from "../Settings/ExportImportData";

export const SettingsPage = () => {
    const [debugMode, setDebugMode] = useAtom(debugModeAtom);

    return (
        <Box id="SettingsPage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
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
                        <Box d="flex">
                            <SwitchInput
                                ml="auto"
                                id="debugModeSwitch"
                                label="Debug mode"
                                onChange={(e) => setDebugMode(e.target.checked)}
                                isChecked={debugMode}
                            />
                        </Box>
                    </Stack>
                </Box>
                {debugMode && (
                    <Box mt="4">
                        <DebugModeOnly />
                    </Box>
                )}
            </Flex>
        </Box>
    );
};

const DebugModeOnly = () => {
    const exerciseList = useExerciseList();
    const programList = useProgramList();
    const dailyList = useDailyList();

    return <DataAccordions exerciseList={exerciseList} programList={programList} dailyList={dailyList} showIdColumn />;
};

const EditableList = () => {
    const tagList = useTagList();
    const categoryList = useCategoryList();
    const groupList = useGroupList();
    const isDebugMode = useAtomValue(debugModeAtom);

    return (
        <DataAccordions
            tagList={tagList}
            categoryList={categoryList}
            groupList={groupList}
            withActions
            showIdColumn={isDebugMode}
        />
    );
};
