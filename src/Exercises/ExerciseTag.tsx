import { Tag } from "@/orm-types";
import { Badge } from "@chakra-ui/react";

export const ExerciseTag = ({ tag }: { tag: Tag }) => (
    <Badge key={tag.id} variant="subtle" colorScheme="pink" fontSize="xx-small">
        {tag.label}
    </Badge>
);
