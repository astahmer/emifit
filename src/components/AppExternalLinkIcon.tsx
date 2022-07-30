import { ExternalLinkIcon } from "@chakra-ui/icons";
import { ComponentProps } from "react";

export const AppExternalLinkIcon = (props: ComponentProps<typeof ExternalLinkIcon>) => (
    <ExternalLinkIcon color="pink.700" opacity="0.6" boxSize="3" {...props} />
);
