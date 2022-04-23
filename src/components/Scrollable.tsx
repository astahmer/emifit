import { Flex, FlexProps, Stack, StackProps } from "@chakra-ui/react";

export const Scrollable = (props: FlexProps) => <Flex flexDir="column" overflow="auto" h="100%" {...props} />;
export const ScrollableStack = (props: StackProps) => <Stack overflow="auto" h="100%" {...props} />;
