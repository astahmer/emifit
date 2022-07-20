import { ConfirmationButton } from "@/fields/ConfirmationButton";
import { loadFromJSON, saveAsJSON } from "@/functions/json";
import { computeSnapshotFromExport, ExportedData, getDatabaseSnapshot } from "@/functions/snapshot";
import { toasts } from "@/functions/toasts";
import { orm } from "@/orm";
import { runMigrations } from "@/orm-migrations";
import { getMostRecentsExerciseById } from "@/orm-utils";
import { debugModeAtom } from "@/store";
import { AwaitFn } from "@/types";
import { CheckIcon } from "@chakra-ui/icons";
import { Button, Heading, Icon, Stack } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useRef } from "react";
import { BiExport, BiImport } from "react-icons/bi";
import { useMutation } from "react-query";
import { DataAccordions } from "./DataAccordions";

export const ExportImportData = () => {
    const snapshotRef = useRef<null | AwaitFn<typeof getDatabaseSnapshot>>(null);
    const exportMutation = useMutation(
        async () => {
            const snapshot = await getDatabaseSnapshot();
            return saveAsJSON(JSON.stringify(snapshot, null, 0));
        },
        {
            onSuccess: () => void toasts.success("Data exported successfully"),
            onError: (err) =>
                void toasts.error((err as Error)?.message || "Something unexpected happened while exporting data"),
        }
    );

    const loadMutation = useMutation(
        async () => {
            const imported = await loadFromJSON<ExportedData>();
            console.log(imported);
            snapshotRef.current = imported;
            return computeSnapshotFromExport(imported);
        },
        {
            onSuccess: () => void toasts.success("Data loaded successfully"),
            onError: (err) => {
                // @ts-ignore
                if (err.message === "The user aborted a request.") return;
                void toasts.error("Something unexpected happened while loading data");
            },
        }
    );
    const importMutation = useMutation(
        async () => {
            const snapshot = snapshotRef.current;
            console.log(orm.version, snapshot.version);
            await Promise.all([
                orm.db.clear(orm.daily.name),
                orm.db.clear(orm.exercise.name),
                orm.db.clear(orm.program.name),
                orm.db.clear(orm.tag.name),
                orm.db.clear(orm.category.name),
            ]);

            const tx = orm.db.transaction(orm.db.objectStoreNames, "readwrite");
            await runMigrations(orm.db, snapshot.version, orm.version, tx, async () => {
                const categoryStore = tx.objectStore(orm.category.name);
                const tagStore = tx.objectStore(orm.tag.name);
                const exoStore = tx.objectStore(orm.exercise.name);
                const dailyStore = tx.objectStore(orm.daily.name);
                const programStore = tx.objectStore(orm.program.name);

                const tagList = snapshot.tagList.map((tag) => tagStore.add(tag));
                const categoryList = snapshot.categoryList.map((category) => categoryStore.add(category));
                const exerciseList = snapshot.exerciseList.map((exo) => exoStore.add(exo));
                const dailyList = snapshot.dailyList.map((daily) => dailyStore.add(daily));
                const programList = snapshot.programList.map((program) => programStore.add(program));
                // TODO programListOrder
                await Promise.all([...tagList, ...categoryList, ...exerciseList, ...dailyList, ...programList]);
            });
            await tx.done;
        },
        {
            onSuccess: () => {
                void toasts.success("Data imported successfully");
                window.location.reload();
            },
            onError: () => void toasts.error("Something unexpected happened while importing data"),
        }
    );

    const isDebugMode = useAtomValue(debugModeAtom);
    loadMutation.data && console.log(loadMutation.data);

    return (
        <Stack>
            <Stack direction="row" ml="auto">
                <Button
                    leftIcon={<Icon as={BiImport} />}
                    colorScheme="pink"
                    onClick={exportMutation.mutate.bind(undefined)}
                >
                    Export
                </Button>
                <Button
                    leftIcon={<Icon as={BiExport} />}
                    colorScheme="pink"
                    variant="outline"
                    onClick={loadMutation.mutate.bind(undefined)}
                >
                    Import
                </Button>
            </Stack>
            {loadMutation.data && (
                <>
                    <Heading as="h4" fontSize="md">
                        Loaded data preview from import
                    </Heading>
                    <DataAccordions
                        exerciseList={getMostRecentsExerciseById(loadMutation.data.exerciseList)}
                        programList={loadMutation.data.programList}
                        dailyList={loadMutation.data.dailyList}
                        tagList={loadMutation.data.tagList}
                        categoryList={loadMutation.data.categoryList}
                        groupList={loadMutation.data.groupList}
                        showIdColumn={isDebugMode}
                    />
                    <ConfirmationButton
                        onConfirm={importMutation.mutate.bind(undefined)}
                        colorScheme="twitter"
                        renderTrigger={(onOpen) => (
                            <Button
                                leftIcon={<Icon as={CheckIcon} />}
                                colorScheme="pink"
                                variant="outline"
                                onClick={onOpen}
                            >
                                Save loaded data
                            </Button>
                        )}
                    />
                </>
            )}
        </Stack>
    );
};
