import { CheckCircleIcon } from "@chakra-ui/icons";
import { Icon, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { reverse } from "@pastable/core";
import { useEffect, useRef, useState } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomTabs = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let index = indexByRoutes[location.pathname];
        if (index === undefined && location.pathname.startsWith(routesByIndex[2])) {
            index = 2;
        }

        setTabIndex(index);
    }, [location.pathname]);

    const submitBtnRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <Tabs
                w="100%"
                variant="enclosed"
                isFitted
                index={tabIndex}
                onChange={(index) => navigate(routesByIndex[index])}
                borderTop="1px solid"
                borderTopColor="gray.300"
                bgColor="gray.50"
            >
                <TabList>
                    <Tab h="58px">Home</Tab>
                    <Tab h="58px">
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
                    {/* <Tab h="58px">Progress</Tab> */}
                    <Tab h="58px">Programs</Tab>
                </TabList>
            </Tabs>
            <button ref={submitBtnRef} hidden type="submit" form="add-form" />
        </>
    );
};

const routesByIndex = { 0: "/", 1: "/add", 2: "/programs" };
const indexByRoutes = reverse(routesByIndex);
