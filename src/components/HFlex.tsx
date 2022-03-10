import { Flex, forwardRef } from "@chakra-ui/react";

export const HFlex = forwardRef((props, ref) => <Flex ref={ref} {...props} flexDirection="column" />);
