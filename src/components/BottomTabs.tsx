import { CheckCircleIcon } from "@chakra-ui/icons";
import { Icon, Tab, TabList, Tabs } from "@chakra-ui/react";
import { useRef } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { Link as ReactLink, useLocation } from "react-router-dom";

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
                        Home
                    </Tab>
                    <Tab as={ReactLink} to="/add" w="100%" h="58px">
                        {location.pathname === "/add" ? (
                            <CheckCircleIcon
                                color="pink.400"
                                fontSize="30px"
                                onClick={() => submitBtnRef.current?.click()}
                            />
                        ) : (
                            <Icon as={IoIosAddCircle} color="pink.400" fontSize="38px" />
                        )}
                    </Tab>
                    {/* <Tab as={ReactLink} to="/"
as={ReactLink} to="/add"
as={ReactLink} to="/programs"  w="100%" h="58px">Progress</Tab> */}
                    <Tab as={ReactLink} to="/programs" w="100%" h="58px">
                        Programs
                    </Tab>
                </TabList>
            </Tabs>
            <button ref={submitBtnRef} hidden type="submit" form="add-form" />
        </>
    );
};
