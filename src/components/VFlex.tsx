import { Flex, FlexProps, forwardRef } from "@chakra-ui/react";

/** Vertical Flex = flexDirection: column */
export const VFlex = forwardRef((props: FlexProps, ref) => <Flex ref={ref} {...props} flexDirection="column" />);
