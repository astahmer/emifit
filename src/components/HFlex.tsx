import { Flex, FlexProps, forwardRef } from "@chakra-ui/react";

export const HFlex = forwardRef((props: FlexProps, ref) => <Flex ref={ref} {...props} flexDirection="column" />);
