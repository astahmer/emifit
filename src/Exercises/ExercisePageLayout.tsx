import { getRouteTypeFromPathname } from "@/Daily/DailyExercisePageLayout";
import { Box, Heading } from "@chakra-ui/react";
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
        <Box id="DailyExercisePageLayout" as="section" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">{title}</Heading>
            <Box id="DailyExercisePageLayoutOutlet" d="flex" flexDirection="column" mt="auto" minH="0">
                <Outlet />
            </Box>
        </Box>
    );
}
