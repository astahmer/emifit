import {
    Box,
    Button,
    chakra,
    Divider,
    Flex,
    Icon,
    List,
    ListItem,
    Stack,
    Text,
    useDisclosure,
    UseDisclosureReturn,
} from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { ErrorBoundary } from "react-error-boundary";
import { useHotkeys } from "react-hotkeys-hook";
import { ReactQueryDevtools } from "react-query/devtools";
import { Outlet } from "react-router-dom";
import { BottomTabs } from "./components/BottomTabs";
import { ErrorFallback } from "./components/ErrorFallback";
import { DevTools } from "./DevTools";
import { debugModeAtom, isSwipingCarouselRef } from "./store";

import {
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/react";
import { useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { IoHome, IoLibraryOutline, IoListSharp } from "react-icons/io5";
import { AiFillHome } from "react-icons/ai";
import { GiProgression } from "react-icons/gi";
import { FiSettings } from "react-icons/fi";
import { Link as ReactLink, useLocation } from "react-router-dom";
import { useCurrentDaily, useCurrentDailyCategory } from "./orm-hooks";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { createContextWithHook } from "./functions/createContextWithHook";

export const Layout = () => {
    const setDebugMode = useSetAtom(debugModeAtom);
    useHotkeys("cmd+k", () => setDebugMode((current) => !current));

    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef();
    const mainDragProps = useSwipeable({
        delta: 30,
        onSwipedRight: () => {
            if (isSwipingCarouselRef.current) {
                return;
            }
            onOpen();
        },
    });
    const drawerDragProps = useSwipeable({
        delta: 30,
        onSwipedLeft: onClose,
        onSwipeStart: (info) => console.log(info),
    });

    return (
        <Flex as="main" direction="column" boxSize="100%" {...mainDragProps} style={{ touchAction: "none" }}>
            <Flex as="section" id="View" direction="column" h="100%" overflow="hidden">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Outlet />
                </ErrorBoundary>
            </Flex>
            <DevTools />
            <Box as="footer" mt="auto" w="100%" flexShrink={0}>
                <BottomTabs />
            </Box>
            <Box pos="fixed" bottom="70px">
                <ReactQueryDevtools toggleButtonProps={{ style: { position: "absolute" } }} />
            </Box>
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay />
                <div {...drawerDragProps}>
                    <DrawerContent>
                        <SidebarProvider value={{ onClose }}>
                            <DrawerCloseButton />
                            <DrawerHeader>
                                <SidebarHeader />
                            </DrawerHeader>
                            <Divider mb="6" />
                            <DrawerBody>
                                <SidebarContent />
                            </DrawerBody>
                        </SidebarProvider>
                    </DrawerContent>
                </div>
            </Drawer>
        </Flex>
    );
};

const [SidebarProvider, useSidebar] = createContextWithHook<Pick<UseDisclosureReturn, "onClose">>("Sidebar");

const SidebarHeader = () => {
    const daily = useCurrentDaily();
    const category = useCurrentDailyCategory();

    return (
        <Stack>
            <Flex alignItems="flex-start">
                <Text>EmiFIT</Text>
                <Text ml="auto" mr="6" fontSize="x-small">
                    v{import.meta.env.VITE_APP_VERSION} [{import.meta.env.DEV ? "dev" : "prod"}]
                </Text>
            </Flex>
            {daily && (
                <Box fontSize="sm">
                    <span>{daily.id}</span>
                    {category && (
                        <Box display="flex" alignItems="center">
                            <Box
                                mr="2"
                                borderRadius="md"
                                h="10px"
                                w="10px"
                                p={0}
                                minW="10px"
                                bg={category.color || "pink.300"}
                            />
                            <span>{category.name}</span>
                        </Box>
                    )}
                </Box>
            )}
        </Stack>
    );
};

const SidebarContent = () => {
    const { onClose } = useSidebar();

    return (
        <Stack as={List} mt="auto" fontSize="xl" spacing={2}>
            <ReactLink to="/" onClick={onClose}>
                <Flex as={ListItem} alignItems="center">
                    <Icon as={AiFillHome} mr="4" />
                    <Text>Home / edit daily</Text>
                    <ChevronRightIcon ml="auto" />
                </Flex>
            </ReactLink>
            <ReactLink to="/progress" onClick={onClose}>
                <Flex as={ListItem} alignItems="center">
                    <Icon as={GiProgression} mr="4" />
                    <Text>Progress</Text>
                    <ChevronRightIcon ml="auto" />
                </Flex>
            </ReactLink>
            <ReactLink to="/programs" onClick={onClose}>
                <Flex as={ListItem} alignItems="center">
                    <Icon as={IoListSharp} mr="4" />
                    <Text>Programs</Text>
                    <ChevronRightIcon ml="auto" />
                </Flex>
            </ReactLink>
            <ReactLink to="/exercise-library" onClick={onClose}>
                <Flex as={ListItem} alignItems="center">
                    <Icon as={IoLibraryOutline} mr="4" />
                    <Text>Exercise library</Text>
                    <ChevronRightIcon ml="auto" />
                </Flex>
            </ReactLink>
            <ReactLink to="/settings" onClick={onClose}>
                <Flex as={ListItem} alignItems="center">
                    <Icon as={FiSettings} mr="4" />
                    <Text>Settings</Text>
                    <ChevronRightIcon ml="auto" />
                </Flex>
            </ReactLink>
        </Stack>
    );
};
