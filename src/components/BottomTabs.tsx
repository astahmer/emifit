import {
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Icon,
    IconButton,
    Box,
    Button,
    useMultiStyleConfig,
    useTab,
    ButtonProps,
} from "@chakra-ui/react";
import { AddIcon, CheckCircleIcon, CheckIcon } from "@chakra-ui/icons";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { reverse, WithChildren } from "@pastable/core";
import { IoIosAddCircle, IoMdAddCircle } from "react-icons/io";

export const BottomTabs = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setTabIndex(indexByRoutes[location.pathname]);
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
                <TabPanels>
                    <TabPanel>
                        <p>one!</p>
                    </TabPanel>
                    <TabPanel>
                        <p>two!</p>
                    </TabPanel>
                    <TabPanel>
                        <p>three!</p>
                    </TabPanel>
                </TabPanels>
                <TabList>
                    <Tab h="58px">Home</Tab>
                    <Tab h="58px">
                        {location.pathname === "/add" ? (
                            // <IconButton
                            //     as="div"
                            //     aria-label="Submit form"
                            //     icon={<CheckCircleIcon color="whatsapp.600" fontSize="30px" />}
                            //     onClick={() => submitBtnRef.current?.click()}
                            // />
                            <CheckCircleIcon
                                color="whatsapp.600"
                                fontSize="30px"
                                onClick={() => submitBtnRef.current?.click()}
                            />
                        ) : (
                            <Icon as={IoIosAddCircle} color="twitter.400" fontSize="38px" />
                        )}
                    </Tab>
                    {/* <SubmitTab h="58px">
                    <Icon as={IoIosAddCircle} color="twitter.400" fontSize="38px" />
                </SubmitTab> */}
                    <Tab h="58px">Progress</Tab>
                </TabList>
            </Tabs>
            <button ref={submitBtnRef} hidden type="submit" form="add-form" />
        </>
    );
};

const SubmitTab = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    // 1. Reuse the `useTab` hook
    const tabProps = useTab({ ...props, ref });
    // const isSelected = !!tabProps["aria-selected"];

    // 2. Hook into the Tabs `size`, `variant`, props
    const styles = useMultiStyleConfig("Tabs", tabProps);

    const location = useLocation();
    const isSelected = location.pathname === "/add";
    console.log(isSelected, tabProps);

    return isSelected ? (
        <IconButton
            __css={styles.tab}
            {...tabProps}
            {...props}
            type="submit"
            form="hook-form"
            aria-label="Submit form"
            icon={<CheckCircleIcon color="whatsapp.600" fontSize="30px" />}
        />
    ) : (
        <Button
            __css={styles.tab}
            {...tabProps}
            {...props}
            // {...(isSelected
            //     ? {
            //         //   type: "submit",
            //         //   form: "hook-form",
            //         //   "aria-label": "Submit form",
            //         //   icon: <CheckCircleIcon color="whatsapp.600" fontSize="30px" />,
            //         as: <IconButton
            //         type="submit"
            //         form="hook-form"
            //         aria-label="Submit form"
            //         icon={<CheckCircleIcon color="whatsapp.600" fontSize="30px" />}
            //     />
            //       }
            //     : {})}
        >
            {isSelected ? null : tabProps.children}
        </Button>
    );
});

const routesByIndex = { 0: "/", 1: "/add", 2: "/progress" };
const indexByRoutes = reverse(routesByIndex);
