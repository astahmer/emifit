import { CheckCircleIcon } from "@chakra-ui/icons";
import { chakra, Icon, Tab, TabList, Tabs } from "@chakra-ui/react";
import { useRef } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { GoTasklist } from "react-icons/go";
import { AiFillHome } from "react-icons/ai";
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
                            <span>Home</span>
                        </HFlex>
                    </Tab>
                    <Tab as={ReactLink} to="/add" w="100%" h="58px">
                        {location.pathname === "/add" ? (
                            <HFlex alignItems="center">
                                <CheckCircleIcon
                                    color="pink.400"
                                    fontSize="30px"
                                    onClick={() => submitBtnRef.current?.click()}
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
                    {/* <Tab as={ReactLink} to="/"
as={ReactLink} to="/add"
as={ReactLink} to="/programs"  w="100%" h="58px">Progress</Tab> */}
                    <Tab as={ReactLink} to="/programs" w="100%" h="58px">
                        <HFlex alignItems="center">
                            <Icon as={GoTasklist} />
                            <span>Programs</span>
                        </HFlex>
                    </Tab>
                </TabList>
            </Tabs>
            <button ref={submitBtnRef} hidden type="submit" form="add-form" />
        </>
    );
};
