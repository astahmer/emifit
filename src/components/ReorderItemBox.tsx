import { Box, type BoxProps } from "@chakra-ui/react";
import { Reorder } from "framer-motion";
import { ComponentProps, forwardRef, ForwardRefExoticComponent } from "react";

type ReorderItemBoxComponent = ForwardRefExoticComponent<ComponentProps<typeof Reorder.Item> & Omit<BoxProps, "style">>;
export const ReorderItemBox = forwardRef<HTMLDivElement, BoxProps & ComponentProps<typeof Reorder.Item>>(
    (props, ref) => <Box ref={ref} {...props} as={Reorder.Item} />
) as ReorderItemBoxComponent;
