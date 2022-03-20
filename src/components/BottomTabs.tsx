import { CheckCircleIcon } from "@chakra-ui/icons";
import { chakra, Icon, Tab, TabList, Tabs } from "@chakra-ui/react";
import { useRef } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { GiProgression } from "react-icons/gi";
import { GoTasklist } from "react-icons/go";
import { AiFillHome } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { Link as ReactLink, useLocation } from "react-router-dom";
import { HFlex } from "./HFlex";

export const BottomTabs = () => {
    const location = useLocation();
    const submitBtnRef = useRef<HTMLButtonElement>(null);

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
                    <Tab as={ReactLink} to="/" w="100%" h="58px">
                        <HFlex alignItems="center">
                            <Icon as={GiProgression} />
                            <chakra.span fontSize="xs">Progress</chakra.span>
                        </HFlex>
                    </Tab>
                    <Tab as={ReactLink} to="/add-exercise" w="100%" h="58px">
                        {location.pathname === "/add-exercise" ? (
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
                                <Icon as={IoIosAddCircle} color="pink.400" fontSize="38px" />
                                {/* <chakra.span fontSize="xs">Add exercise</chakra.span> */}
                            </HFlex>
                        )}
                    </Tab>
                    <Tab as={ReactLink} to="/programs" w="100%" h="58px">
                        <HFlex alignItems="center">
                            <Icon as={GoTasklist} fontSize="sm" />
                            <chakra.span fontSize="xs">Programs</chakra.span>
                        </HFlex>
                    </Tab>
                    <Tab as={ReactLink} to="/" w="100%" h="58px">
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
