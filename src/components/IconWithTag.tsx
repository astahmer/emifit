import { chakra, ChakraProps } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { ReactNode } from "react";

const defaultTagProps: ChakraProps = {
    position: "absolute",
    top: "-1px",
    right: "-1px",
    px: 2,
    py: 1,
    fontSize: "xs",
    fontWeight: "bold",
    lineHeight: "none",
    color: "red.100",
    transform: "translate(50%,-50%)",
    bg: "red.600",
    rounded: "full",
};

export const IconWithTag = ({
    children,
    renderTag,
}: WithChildren & { renderTag: (defaultProps: typeof defaultTagProps) => ReactNode }) => {
    return (
        <chakra.span pos="relative" display="inline-block">
            {children}
            {renderTag(defaultTagProps)}
        </chakra.span>
    );
};
