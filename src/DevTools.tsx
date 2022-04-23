import { Box, Button, Stack } from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { SwitchInput } from "./components/SwitchInput";
import { toasts } from "./functions/toasts";
import { orm } from "./orm";
import { currentDailyIdAtom, debugModeAtom, showSkeletonsAtom } from "./store";
import { useDailyInvalidate } from "./orm-hooks";

export function DevTools() {
    const debugMode = useAtomValue(debugModeAtom);
    if (!debugMode) return null;

    return (
        <Box
            as="footer"
            mt="auto"
            w="100%"
            flexShrink={0}
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
                    orm.daily.delete(dailyId);
                    invalidate();
                }}
            >
                Delete today's entry
            </Button>
            <Button
                onClick={async () => {
                    const info = toasts.info("Clearing DB...");
                    await Promise.all([
                        orm.db.clear(orm.daily.name),
                        orm.db.clear(orm.exercise.name),
                        orm.db.clear(orm.program.name),
                    ]);
                    toasts.success("Database cleared");
                    toasts.close(info);
                    invalidate();
                    window.location.reload();
                }}
            >
                Reset DB
            </Button>
        </Stack>
    );
};
