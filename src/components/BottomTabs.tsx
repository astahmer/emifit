import { CheckCircleIcon } from "@chakra-ui/icons";
import { chakra, Icon, Tab, TabList, Tabs } from "@chakra-ui/react";
import { useRef } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { IoListSharp } from "react-icons/io5";
import { GiProgression } from "react-icons/gi";
import { AiFillHome } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { Link as ReactLink, useLocation } from "react-router-dom";
import { VFlex } from "./VFlex";
import { useDailyQuery } from "@/orm-hooks";
import { printDailyDate } from "@/orm-utils";
import { printDate } from "@/functions/utils";
import { match } from "ts-pattern";

export const BottomTabs = () => {
    const location = useLocation();
    const index = getDefaultTabIndex(location.pathname);

    const todaysDaily = useDailyQuery(printDate(new Date()));
    const hasCreatedTodaysDaily = Boolean(todaysDaily.data?.id);
    const addExerciseLink = `/daily/entry/${printDailyDate(new Date())}${hasCreatedTodaysDaily ? `/exercise/add` : ""}`;

    const submitBtnRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <Tabs
                w="100%"
                variant="enclosed"
                isFitted
                boxShadow="dark-lg"
                bgColor="gray.50"
                borderRadius="3xl"
                index={index}
            >
                <TabList borderRadius="3xl" pb="6">
                    <Tab as={ReactLink} to="/" w="100%" h="58px">
                        <VFlex alignItems="center">
                            <Icon as={AiFillHome} />
                            <chakra.span fontSize="xs">Home</chakra.span>
                        </VFlex>
                    </Tab>
                    <Tab as={ReactLink} to="/progress" w="100%" h="58px">
                        <VFlex alignItems="center">
                            <Icon as={GiProgression} fontSize="sm" />
                            <chakra.span fontSize="xs">Progress</chakra.span>
                        </VFlex>
                    </Tab>
                    <Tab as={ReactLink} to={addExerciseLink} w="100%" h="58px">
                        {location.pathname === addExerciseLink ? (
                            <VFlex alignItems="center">
                                <CheckCircleIcon
                                    color="pink.400"
                                    fontSize="30px"
                                    onClick={(e) => (
                                        e.stopPropagation(), e.preventDefault(), submitBtnRef.current?.click()
                                    )}
                                />
                                {/* <chakra.span fontSize="xs">Create exercise</chakra.span> */}
                            </VFlex>
                        ) : (
                            <VFlex alignItems="center">
                                <Icon as={IoIosAddCircle} color={"pink.400"} fontSize="38px" />
                                {/* <chakra.span fontSize="xs">Add exercise</chakra.span> */}
                            </VFlex>
                        )}
                    </Tab>
                    <Tab as={ReactLink} to="/programs" w="100%" h="58px">
                        <VFlex alignItems="center">
                            <Icon as={IoListSharp} fontSize="lg" />
                            <chakra.span fontSize="xs">Programs</chakra.span>
                        </VFlex>
                    </Tab>
                    <Tab as={ReactLink} to="/settings" w="100%" h="58px">
                        <VFlex alignItems="center">
                            <Icon as={FiSettings} />
                            <chakra.span fontSize="xs">Settings</chakra.span>
                        </VFlex>
                    </Tab>
                </TabList>
            </Tabs>
            <button ref={submitBtnRef} hidden type="submit" form="single-form" />
        </>
    );
};

const getDefaultTabIndex = (pathname: string) =>
    match(pathname)
        .when(
            (path) => path === "/" || (path.startsWith("/daily/entry") && !path.includes("exercise")),
            () => 0
        )
        .when(
            (path) => path.startsWith("/progress"),
            () => 1
        )
        .when(
            (path) => path.startsWith("/daily/entry") && path.includes("exercise"),
            () => 2
        )
        .when(
            (path) => path.startsWith("/programs"),
            () => 3
        )
        .when(
            (path) => path.startsWith("/settings"),
            () => 4
        )
        .otherwise(() => -1);
