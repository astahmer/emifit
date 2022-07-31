import { Box, Button, Stack } from "@chakra-ui/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { SwitchInput } from "./fields/SwitchInput";
import { toasts } from "./functions/toasts";
import { orm } from "./orm";
import { currentDailyIdAtom, debugModeAtom, showSkeletonsAtom } from "./store";
import { useCurrentDailyInvalidate } from "./orm-hooks";
import { ConfirmationButton } from "./fields/ConfirmationButton";
import { useLocation } from "react-router-dom";

export function DevTools() {
    const debugMode = useAtomValue(debugModeAtom);
    const location = useLocation();
    if (!debugMode) return null;

    return (
        <Box
            as="footer"
            mt="auto"
            w="100%"
            flexShrink={0}
            position={location.pathname.includes("/settings") ? "relative" : "fixed"}
            bottom="50px"
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
    const invalidate = useCurrentDailyInvalidate();

    const [debugMode, setDebugMode] = useAtom(debugModeAtom);

    return (
        <Stack fontSize="sm">
            <SwitchInput
                ml="auto"
                id="debugModeSwitch"
                label="Debug mode"
                onChange={(e) => setDebugMode(e.target.checked)}
                isChecked={debugMode}
            />
            <SwitchInput label="With skeletons" onChange={(e) => setShowSkeletons(e.target.checked)} />
            <ConfirmationButton
                onConfirm={() => {
                    orm.daily.delete(dailyId);
                    invalidate();
                }}
                renderTrigger={(onOpen) => <Button onClick={onOpen}>Delete today's entry</Button>}
            />
            <ConfirmationButton
                onConfirm={async () => {
                    const info = toasts.info("Clearing DB...");
                    await Promise.all([
                        orm.db.clear(orm.daily.name),
                        orm.db.clear(orm.exercise.name),
                        orm.db.clear(orm.program.name),
                        orm.db.clear(orm.tag.name),
                        orm.db.clear(orm.category.name),
                    ]);
                    toasts.success("Database cleared");
                    toasts.close(info);
                    invalidate();
                    window.location.reload();
                }}
                renderTrigger={(onOpen) => <Button onClick={onOpen}>Reset DB</Button>}
            />
        </Stack>
    );
};
