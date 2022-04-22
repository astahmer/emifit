import { Tag } from "@/orm-types";
import { Badge, BadgeProps } from "@chakra-ui/react";

export const ExerciseTag = ({ tag, ...props }: { tag: Tag } & BadgeProps) => (
    <Badge key={tag.id} variant="subtle" colorScheme="pink" fontSize="xx-small" {...props}>
        {tag.label}
    </Badge>
);
