import { VFlex } from "@/components/VFlex";
import { getRouteTypeFromPathname } from "@/Daily/DailyExercisePageLayout";
import { FooterSpacer, ViewLayout } from "@/Layout";
import { Heading } from "@chakra-ui/react";
import { Outlet, useLocation } from "react-router-dom";
import { match } from "ts-pattern";

export function ExercisePageLayout() {
    const location = useLocation();

    const route = getRouteTypeFromPathname(location.pathname);
    const title = match(route)
        .with("add", () => "Add exercise")
        .with("copy", () => "Copy exercise")
        .with("edit", () => "Edit exercise")
        .with("edit-superset", () => "Edit superset exercise")
        .run();

    return (
        <ViewLayout>
            <ViewLayout id="ExercisePageLayout" p="4">
                <Heading as="h1">{title}</Heading>
                <VFlex id="ExercisePageLayoutOutlet" mt="auto" minH="0">
                    <Outlet />
                </VFlex>
            </ViewLayout>
            <FooterSpacer />
        </ViewLayout>
    );
}
