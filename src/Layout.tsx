import {
    Box,
    BoxProps,
    Divider,
    Flex,
    FlexProps,
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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet } from "react-router-dom";
import { BottomTabs } from "./components/BottomTabs";
import { ErrorFallback } from "./components/ErrorFallback";
import { DevTools } from "./DevTools";
import { CompactProvider, currentDateAtom, debugModeAtom, isDailyTodayAtom, isSwipingCarouselRef } from "./store";

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
import { useEffect, useRef, useState } from "react";
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
import { useCurrentDailyCategory, useDailyQuery } from "./orm-hooks";
import { on } from "pastable";
import { createMachine } from "xstate";
import { useInterpret } from "@xstate/react";
import { printDate } from "./functions/utils";

export const Layout = () => {
    const setDebugMode = useSetAtom(debugModeAtom);
    useHotkeys("cmd+k", () => setDebugMode((current) => !current));

    const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
    const btnRef = useRef();
    useHotkeys("cmd+i", onToggle);

    const isScrollingRef = useRef(false);
    const service = useInterpret(scrollMachine, undefined, (state) => {
        isScrollingRef.current = state.matches("scrolling");
    });

    // Keep track of when user is scrolling to disable swiping in the meantime
    useEffect(() => {
        return on(
            window,
            "scroll",
            (e) => {
                if (e.type !== "scroll") return;

                service.send("Scroll");
            },
            true
        );
    }, [service]);

    const mainDragProps = useSwipeable({
        delta: 30,
        onSwipedRight: (e) => {
            if (isSwipingCarouselRef.current || isScrollingRef.current) {
                return;
            }
            onOpen();
        },
    });
    const drawerDragProps = useSwipeable({ delta: 30, onSwipedLeft: onClose });

    const [isCompact, setIsCompact] = useState(true);
    useDailyQuery(printDate(new Date()), { staleTime: 60 * 1000 });

    return (
        <Flex
            id="Layout"
            as="main"
            direction="column"
            boxSize="100%"
            {...mainDragProps}
            style={{ touchAction: "none" }}
        >
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <CompactProvider value={[isCompact, setIsCompact]}>
                    <Outlet />
                </CompactProvider>
            </ErrorBoundary>
            <DevTools />
            <Box as="footer" mt="auto" w="100%" flexShrink={0} pos="fixed" bottom="-20px">
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

export const ViewLayout = (props: FlexProps) => (
    <Flex {...props} as="section" className="View" direction="column" h="100%" overflow="hidden" pos="relative" />
);
export const FooterSpacer = (props: BoxProps) => <Box h="75px" {...props} />;

const scrollMachine = createMachine({
    id: "scrollMachine",
    initial: "idle",
    schema: { events: {} as { type: "Scroll" } },
    states: {
        idle: {
            on: { Scroll: "scrolling" },
        },
        scrolling: {
            after: { 400: "idle" },
        },
    },
});

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
