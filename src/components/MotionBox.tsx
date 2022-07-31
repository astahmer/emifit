import { Box, BoxProps, ChakraComponent } from "@chakra-ui/react";
import { ForwardRefComponent, HTMLMotionProps, motion } from "framer-motion";

export const MotionBox = motion<BoxProps>(Box) as ChakraComponent<
    ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>,
    {}
>;
