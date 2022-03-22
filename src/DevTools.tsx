import { Box, Button, Stack } from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { SwitchInput } from "./components/SwitchInput";
import { orm } from "./orm";
import { currentDailyIdAtom, debugModeAtom, showSkeletonsAtom, useDailyInvalidate } from "./store";

export function DevTools() {
    const debugMode = useAtomValue(debugModeAtom);
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
            bg="gray.400"
            p="4"
            borderTop="1px solid"
            borderColor="gray.300"
        >
            <DevToolsContent />
        </Box>
    );
}

const DevToolsContent = () => {
    const setShowSkeletons = useSetAtom(showSkeletonsAtom);
    const dailyId = useAtomValue(currentDailyIdAtom);
    const invalidate = useDailyInvalidate();

    return (
        <Stack fontSize="sm">
            <SwitchInput label="With skeletons" onChange={(e) => setShowSkeletons(e.target.checked)} />
            <Button
                onClick={() => {
                    orm.daily.remove(dailyId);
                    invalidate();
                }}
            >
                Delete today's entry
            </Button>
        </Stack>
    );
};
