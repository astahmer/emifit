import { VFlex } from "@/components/VFlex";
import { DailyExerciseTaskListSkeleton } from "@/Daily/DailyExerciseTaskListSkeleton";
import { FooterSpacer, ViewLayout } from "@/Layout";
import { useCurrentDailyQuery } from "@/orm-hooks";
import { currentDailyIdAtom, showSkeletonsAtom } from "@/store";
import { Divider, Flex, Heading, Skeleton } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { WithChildren } from "pastable";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import { match } from "ts-pattern";

export const DailyExercisePageLayout = () => (
    <ViewLayout id="DailyExercisePageLayout">
        <DailyExercisePageLayoutContent>
            <Outlet />
        </DailyExercisePageLayoutContent>
        <FooterSpacer />
    </ViewLayout>
);

function DailyExercisePageLayoutContent({ children }: WithChildren) {
    const dailyId = useAtomValue(currentDailyIdAtom);
    const query = useCurrentDailyQuery();
    const daily = query.data;

    const showSkeletons = useAtomValue(showSkeletonsAtom);
    const location = useLocation();

    const route = getRouteTypeFromPathname(location.pathname);
    const title = match(route)
        .with("add", () => "Add daily exercise")
        .with("copy", () => "Copy daily exercise")
        .with("edit", () => "Edit daily exercise")
        .with("edit-superset", () => "Edit dailysuperset")
        .exhaustive();

    if (showSkeletons || query.isLoading) {
        return <DailyExercisePageLayoutSkeleton />;
    }

    return (
        <ViewLayout id="DailyExercisePageLayoutContent" p="4">
            <Heading as="h1">{title} </Heading>
            <Heading as="h2" size="md">
                Daily {dailyId} - {daily?.category}
            </Heading>
            {daily && (
                <VFlex id="DailyExercisePageLayoutOutlet" pt="4" mt="auto" minH="0">
                    {children}
                </VFlex>
            )}
        </ViewLayout>
    );
}

export const DailyExercisePageLayoutSkeleton = () => (
    <Flex id="DailyExercisePageLayoutSkeleton" as="section" flexDirection="column" h="100%" minH={0}>
        <Flex justifyContent="space-around">
            <Skeleton w="100px" h="40px" />
            <Skeleton w="100px" h="40px" />
            <Skeleton w="100px" h="40px" />
        </Flex>
        <Divider mt="4" />
        <DailyExerciseTaskListSkeleton />
    </Flex>
);

export function getRouteTypeFromPathname(pathname: string) {
    return match(pathname)
        .when(
            (path) => matchPath("daily/entry/:dailyId/exercise/add", path),
            () => "add" as const
        )
        .when(
            (path) => matchPath("daily/entry/:dailyId/exercise/copy", path),
            () => "copy" as const
        )
        .when(
            (path) =>
                matchPath("daily/entry/:dailyId/exercise/edit/:exoId", path) || matchPath("exercise/edit/:exoId", path),
            () => "edit" as const
        )
        .when(
            (path) =>
                matchPath("daily/entry/:dailyId/exercise/superset/edit/:supersetId", path) ||
                matchPath("exercise/superset/edit/:supersetId", path),
            () => "edit-superset" as const
        )
        .run();
}
