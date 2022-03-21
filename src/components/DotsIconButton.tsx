import { forwardRef, IconButton, IconButtonProps } from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

export const DotsIconButton = forwardRef((props: IconButtonProps, ref) => (
    <IconButton
        ref={ref}
        aria-label="validate"
        {...props}
        icon={<BsThreeDotsVertical />}
        variant="solid"
        size="sm"
        colorScheme="pink"
        opacity={0.6}
    />
));
