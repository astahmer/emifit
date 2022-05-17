import { CheckCircleIcon } from "@chakra-ui/icons";
import { chakra, Icon, Tab, TabList, Tabs } from "@chakra-ui/react";
import { useRef } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { IoListSharp } from "react-icons/io5";
import { GiProgression } from "react-icons/gi";
import { AiFillHome } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { Link as ReactLink, useLocation } from "react-router-dom";
import { HFlex } from "./HFlex";
import { useDailyQuery } from "@/orm-hooks";
import { printDailyDate } from "@/orm-utils";
import { printDate } from "@/functions/utils";

export const BottomTabs = () => {
    const location = useLocation();
    const submitBtnRef = useRef<HTMLButtonElement>(null);
    const todaysDaily = useDailyQuery(printDate(new Date()));
    const hasCreatedTodaysDaily = Boolean(todaysDaily.data?.id);
    const addExerciseLink = `daily/entry/${printDailyDate(new Date())}${hasCreatedTodaysDaily ? `/exercise/add` : ""}`;

    return (
        <>
            <Tabs
                w="100%"
                variant="enclosed"
                isFitted
                borderTop="1px solid"
                borderTopColor="gray.300"
                bgColor="gray.50"
            >
                <TabList>
                    <Tab as={ReactLink} to="/" w="100%" h="58px">
                        <HFlex alignItems="center">
                            <Icon as={AiFillHome} />
                            <chakra.span fontSize="xs">Home</chakra.span>
                        </HFlex>
                    </Tab>
                    <Tab as={ReactLink} to="/progress" w="100%" h="58px">
                        <HFlex alignItems="center">
                            <Icon as={GiProgression} fontSize="sm" />
                            <chakra.span fontSize="xs">Progress</chakra.span>
                        </HFlex>
                    </Tab>
                    <Tab as={ReactLink} to={addExerciseLink} w="100%" h="58px">
                        {location.pathname === addExerciseLink ? (
                            <HFlex alignItems="center">
                                <CheckCircleIcon
                                    color="pink.400"
                                    fontSize="30px"
                                    onClick={(e) => (
                                        e.stopPropagation(), e.preventDefault(), submitBtnRef.current?.click()
                                    )}
                                />
                                {/* <chakra.span fontSize="xs">Create exercise</chakra.span> */}
                            </HFlex>
                        ) : (
                            <HFlex alignItems="center">
                                <Icon as={IoIosAddCircle} color={"pink.400"} fontSize="38px" />
                                {/* <chakra.span fontSize="xs">Add exercise</chakra.span> */}
                            </HFlex>
                        )}
                    </Tab>
                    <Tab as={ReactLink} to="/programs" w="100%" h="58px">
                        <HFlex alignItems="center">
                            <Icon as={IoListSharp} fontSize="lg" />
                            <chakra.span fontSize="xs">Programs</chakra.span>
                        </HFlex>
                    </Tab>
                    <Tab as={ReactLink} to="/settings" w="100%" h="58px">
                        <HFlex alignItems="center">
                            <Icon as={FiSettings} />
                            <chakra.span fontSize="xs">Settings</chakra.span>
                        </HFlex>
                    </Tab>
                </TabList>
            </Tabs>
            <button ref={submitBtnRef} hidden type="submit" form="add-form" />
        </>
    );
};
