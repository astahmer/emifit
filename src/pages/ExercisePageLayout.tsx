import { DailyExerciseTaskListSkeleton } from "@/Daily/DailyExerciseTaskListSkeleton";
import { useCurrentDailyQuery } from "@/orm-hooks";
import { currentDailyIdAtom, showSkeletonsAtom } from "@/store";
import { Box, Divider, Flex, Heading, Skeleton } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import { match } from "ts-pattern";

export function ExercisePageLayout() {
    const dailyId = useAtomValue(currentDailyIdAtom);
    const query = useCurrentDailyQuery();
    const daily = query.data;

    const showSkeletons = useAtomValue(showSkeletonsAtom);
    const location = useLocation();

    const route = getRouteTypeFromPathname(location.pathname);
    const title = match(route)
        .with("add", () => "Add exercise")
        .with("edit", () => "Edit exercise")
        .with("edit-superset", () => "Edit superset exercise")
        .exhaustive();

    if (showSkeletons || query.isLoading) {
        return (
            <Flex id="ExercisePageLayoutSkeleton" as="section" flexDirection="column" h="100%" minH={0}>
                <Flex justifyContent="space-around">
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                    <Skeleton w="100px" h="40px" />
                </Flex>
                <Divider mt="4" />
                <DailyExerciseTaskListSkeleton />
            </Flex>
        );
    }

    return (
        <Box id="ExercisePageLayout" as="section" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">{title} </Heading>
            <Heading as="h2" size="md">
                {dailyId} - {daily?.category}
            </Heading>
            {daily && (
                <Box id="ExercisePageLayoutOutlet" d="flex" flexDirection="column" mt="auto" minH="0">
                    <Outlet />
                </Box>
            )}
        </Box>
    );
}

export function getRouteTypeFromPathname(pathname: string) {
    return match(pathname)
        .when(
            (path) => matchPath("daily/entry/:dailyId/exercise/add", path),
            () => "add" as const
        )
        .when(
            (path) => matchPath("daily/entry/:dailyId/exercise/edit/:exerciseId", path),
            () => "edit" as const
        )
        .when(
            (path) => matchPath("daily/entry/:dailyId/exercise/superset/edit/:supersetId", path),
            () => "edit-superset" as const
        )
        .run();
}
