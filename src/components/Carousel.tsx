import { isSwipingCarouselRef } from "@/store";
import { Box, BoxProps, ChakraComponent } from "@chakra-ui/react";
import { getClosestNbIn } from "pastable";
import { ForwardRefComponent, HTMLMotionProps, motion, PanInfo, useAnimation, useMotionValue } from "framer-motion";
import { ReactNode, useLayoutEffect, useRef, useState } from "react";

const MotionBox = motion<BoxProps>(Box) as ChakraComponent<
    ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>,
    {}
>;

export function Carousel<T = any>({
    items,
    renderItems,
    config,
    controlledIndex,
    defaultIndex,
}: {
    items: T[];
    renderItems: (props: {
        activeIndex: number;
        itemRefMap: Map<number, HTMLDivElement>;
        isDragging: boolean;
    }) => ReactNode;
    config?: CarouselConfig;
    controlledIndex?: number;
    defaultIndex?: number;
}) {
    const parentRef = useRef<HTMLDivElement>();
    const initialPosRef = useRef<DOMRect>();
    const mergedConfig = { ...defaultConfig, ...config };

    const x = useMotionValue(0);
    const controls = useAnimation();

    const [initialIndex] = useState(() => 0);
    const dragStartPositionRef = useRef(initialIndex);
    const positionsRef = useRef<number[]>();

    const getClosest = (info: PanInfo) => {
        const distance = info.offset.x;
        const velocity = info.velocity.x * mergedConfig.multiplier;
        const direction = velocity < 0 || distance < 0 ? 1 : -1;

        const positions =
            positionsRef.current ||
            [...itemRefMap.current.values()].map((el) => {
                const rect = el.getBoundingClientRect();
                // return rect.x + rect.width / 2;
                return rect.x;
            });
        const dragStartPosition = dragStartPositionRef.current;

        const extrapolatedPosition =
            dragStartPosition + (direction === 1 ? Math.min(velocity, distance) : Math.max(velocity, distance)) * -1;
        const closestPosition = getClosestNbIn(positions, extrapolatedPosition);

        const closestPositionIndex = positions.findIndex((x) => x === closestPosition);
        const closest = items[closestPositionIndex];
        return { closestPosition, closestPositionIndex, closest, direction };
    };

    const itemRefMap = useRef(new Map<number, HTMLDivElement>());
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [isDragging, setIsDragging] = useState(false);

    const animateToIndex = (index: number) => {
        const positions = [...itemRefMap.current.values()].map((el) => el.getBoundingClientRect().x);
        const itemWidths = [...itemRefMap.current.values()].map((el) => el.offsetWidth);

        const dimensions = {
            left: positions[0],
            right: positions[positions.length - 1] + itemWidths[positions.length - 1],
        };
        const carouselWidth = dimensions.left + dimensions.right;
        const carouselCenter = carouselWidth / 2;
        const offset = carouselCenter - itemWidths[index] / 2;

        controls.start({ x: (positions[index] - offset) * -1, transition: mergedConfig.transitionProps });
    };

    useLayoutEffect(() => {
        if (controlledIndex !== undefined) {
            animateToIndex(controlledIndex);
        }
    }, [controlledIndex]);

    return (
        <MotionBox
            aria-label="carousel"
            className="SwipableElement"
            ref={(ref) => {
                if (!ref) return;
                parentRef.current = ref;
                initialPosRef.current = ref.getBoundingClientRect();
            }}
            d="flex"
            drag="x"
            style={{ x }}
            animate={controls}
            dragElastic={0.6}
            onDragStart={() => {
                const positions = [...itemRefMap.current.values()].map((el) => el.getBoundingClientRect().x);
                const currentPos = positions[activeIndex];

                positionsRef.current = positions;
                dragStartPositionRef.current = currentPos;
                isSwipingCarouselRef.current = true;

                if (defaultIndex !== undefined) {
                    animateToIndex(defaultIndex);
                }
            }}
            onDrag={(_e, info) => {
                const closest = getClosest(info);
                setActiveIndex(closest.closestPositionIndex);
            }}
            onDragEnd={(_e, info) => {
                const closest = getClosest(info);
                const positions = [...itemRefMap.current.values()].map((el) => el.getBoundingClientRect().x);
                const itemWidths = [...itemRefMap.current.values()].map((el) => el.offsetWidth);

                const dimensions = {
                    left: positions[0],
                    right: positions[positions.length - 1] + itemWidths[positions.length - 1],
                };
                const carouselWidth = dimensions.left + dimensions.right;
                const carouselCenter = carouselWidth / 2;

                let goToIndex = closest.closestPositionIndex;

                const offset = carouselCenter - itemWidths[closest.closestPositionIndex] / 2;
                const getNextPos = () => positions[goToIndex] - offset;
                const direction = getNextPos() < 0 ? 1 : -1;

                if (mergedConfig.useAvailableSpace) {
                    do {
                        goToIndex += direction;
                    } while (
                        // depends on CarouselProps.config
                        mergedConfig.useAvailableSpace &&
                        // this computes the available space (either to the left or to the right of the carousel depending on direction)
                        // spaceThreshold means that while there might not be enough space to the left or right of the carousel,
                        // the carousel will still be able to move to the next or previous item if there is a Xpx (spaceThreshold) overlap
                        initialPosRef.current.left + Math.abs(getNextPos()) > -mergedConfig.spaceThreshold &&
                        // stay in bounds of the carousel
                        goToIndex >= 0 &&
                        goToIndex < positions.length &&
                        // changing direction means infinite loop so we need to break if that happens
                        (getNextPos() < 0 ? 1 : -1) !== direction
                    );
                }

                controls.start({
                    x: getNextPos() * -1,
                    transition: { velocity: info.velocity.x, ...mergedConfig.transitionProps },
                });
                setActiveIndex(closest.closestPositionIndex);

                setTimeout(() => {
                    setIsDragging(false);
                    isSwipingCarouselRef.current = false;
                }, 100);
            }}
        >
            {renderItems({ itemRefMap: itemRefMap.current, isDragging, activeIndex })}
        </MotionBox>
    );
}

const defaultConfig = {
    multiplier: 0.3,
    transitionProps: { stiffness: 400, type: "spring", damping: 60, mass: 3 },
    spaceThreshold: 30,
    useAvailableSpace: false,
};
interface CarouselConfig {
    multiplier?: number;
    transitionProps?: {
        stiffness?: number;
        type?: string;
        damping?: number;
        mass?: number;
    };
    spaceThreshold?: number;
    useAvailableSpace?: boolean;
}

const DebugCarousel = () => {
    return (
        <>
            <Box d="flex" w="100%">
                <Box w="100%" h="2px" border="1px solid black" />
                <Box pos="absolute" left="50%" translateX="-50%" flexShrink={0} h="100px" border="1px solid red" />
                <Box w="100%" h="2px" border="1px solid black" />
            </Box>
            <Box w="100%">
                <Carousel
                    // items={arr}
                    items={arr}
                    renderItems={({ itemRefMap, activeIndex, isDragging }) =>
                        arr.map((option, index) => (
                            <Box
                                key={index}
                                ref={(ref) => itemRefMap.set(index, ref)}
                                style={{
                                    color: activeIndex === index ? "red" : undefined,
                                    transform: isDragging ? `scale(${activeIndex === index ? 1.2 : 1})` : undefined,
                                }}
                                // whiteSpace="nowrap"
                            >
                                <Box border="1px solid black" p="15px" m="15px">
                                    {option}
                                </Box>
                            </Box>
                        ))
                    }
                />
            </Box>
        </>
    );
};
const arr = [
    "aaaaa",
    "bbbb",
    "cccccccccc",
    "dd",
    "eeeee",
    "ffffffff",
    "gggg",
    "hhhhhh",
    "iiii",
    "jjjj",
    "kkkkk",
    "llllll",
    "mmmmmm",
    "nnnnnnn",
];
