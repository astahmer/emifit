import {
    Box,
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
import { useAtomValue, useSetAtom } from "jotai";
import { ErrorBoundary } from "react-error-boundary";
import { useHotkeys } from "react-hotkeys-hook";
import { ReactQueryDevtools } from "react-query/devtools";
import { Outlet } from "react-router-dom";
import { BottomTabs } from "./components/BottomTabs";
import { ErrorFallback } from "./components/ErrorFallback";
import { DevTools } from "./DevTools";
import { currentDateAtom, debugModeAtom, isDailyTodayAtom, isSwipingCarouselRef } from "./store";

import { ChevronRightIcon } from "@chakra-ui/icons";
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
import { AiFillHome } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { GiProgression } from "react-icons/gi";
import { IoLibraryOutline, IoListSharp } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { GoBackToTodayEntryButton } from "./Daily/GoBackToTodayEntryButton";
import { GoToClosestPreviousDailyEntryButton } from "./Daily/GoToClosestPreviousDailyEntryButton";
import { useLastFilledDailyDate } from "./Daily/useLastFilledDailyDate";
import { createContextWithHook } from "./functions/createContextWithHook";
import { useCurrentDailyCategory } from "./orm-hooks";

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
                            <DrawerFooter>
                                <SidebarFooter />
                            </DrawerFooter>
                        </SidebarProvider>
                    </DrawerContent>
                </div>
            </Drawer>
        </Flex>
    );
};

const [SidebarProvider, useSidebar] = createContextWithHook<Pick<UseDisclosureReturn, "onClose">>("Sidebar");

const SidebarHeader = () => {
    const currentDate = useAtomValue(currentDateAtom);
    const category = useCurrentDailyCategory();

    return (
        <Stack>
            <Flex alignItems="flex-start">
                <Text fontSize="2xl" fontWeight="bold" color="pink.300">
                    EmiFIT
                </Text>
                <Text ml="auto" mr="6" fontSize="small">
                    v{import.meta.env.VITE_APP_VERSION} [{import.meta.env.DEV ? "dev" : "prod"}]
                </Text>
            </Flex>
            <Box fontSize="sm">
                <span>Current daily: {new Date(currentDate).toLocaleDateString()}</span>
                {category && (
                    <Box display="flex" alignItems="center" fontSize="xs">
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
        </Stack>
    );
};

const SidebarContent = () => {
    const { onClose } = useSidebar();

    return (
        <Stack as={List} mt="auto" fontSize="xl" spacing={2}>
            <NavLink to="/" onClick={onClose}>
                {({ isActive }) => (
                    <Flex
                        as={ListItem}
                        alignItems="center"
                        aria-selected={isActive}
                        _selected={{ color: "pink.300", fontWeight: "bold" }}
                    >
                        <Icon as={AiFillHome} mr="4" />
                        <Text>Home / edit daily</Text>
                        <ChevronRightIcon ml="auto" />
                    </Flex>
                )}
            </NavLink>
            <NavLink to="/progress" onClick={onClose}>
                {({ isActive }) => (
                    <Flex
                        as={ListItem}
                        alignItems="center"
                        aria-selected={isActive}
                        _selected={{ color: "pink.300", fontWeight: "bold" }}
                    >
                        <Icon as={GiProgression} mr="4" />
                        <Text>Progress</Text>
                        <ChevronRightIcon ml="auto" />
                    </Flex>
                )}
            </NavLink>
            <NavLink to="/programs" onClick={onClose}>
                {({ isActive }) => (
                    <Flex
                        as={ListItem}
                        alignItems="center"
                        aria-selected={isActive}
                        _selected={{ color: "pink.300", fontWeight: "bold" }}
                    >
                        <Icon as={IoListSharp} mr="4" />
                        <Text>Programs</Text>
                        <ChevronRightIcon ml="auto" />
                    </Flex>
                )}
            </NavLink>
            <NavLink to="/exercise-library" onClick={onClose}>
                {({ isActive }) => (
                    <Flex
                        as={ListItem}
                        alignItems="center"
                        aria-selected={isActive}
                        _selected={{ color: "pink.300", fontWeight: "bold" }}
                    >
                        <Icon as={IoLibraryOutline} mr="4" />
                        <Text>Exercise library</Text>
                        <ChevronRightIcon ml="auto" />
                    </Flex>
                )}
            </NavLink>
            <NavLink to="/settings" onClick={onClose}>
                {({ isActive }) => (
                    <Flex
                        as={ListItem}
                        alignItems="center"
                        aria-selected={isActive}
                        _selected={{ color: "pink.300", fontWeight: "bold" }}
                    >
                        <Icon as={FiSettings} mr="4" />
                        <Text>Settings</Text>
                        <ChevronRightIcon ml="auto" />
                    </Flex>
                )}
            </NavLink>
        </Stack>
    );
};

const SidebarFooter = () => {
    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const lastFilledDaily = useLastFilledDailyDate();

    return (
        <Stack>
            {!isDailyToday && lastFilledDaily && <GoToClosestPreviousDailyEntryButton size="sm" fontSize="xs" />}
            {!isDailyToday && <GoBackToTodayEntryButton size="sm" fontSize="xs" />}
        </Stack>
    );
};
