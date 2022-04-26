import { Tag } from "@/orm-types";
import { Badge, BadgeProps, Wrap, WrapItem, WrapProps } from "@chakra-ui/react";

export const ExerciseTag = ({ tag, ...props }: { tag: Tag } & BadgeProps) => (
    <Badge key={tag.id} variant="subtle" colorScheme="pink" fontSize="xx-small" {...props}>
        {tag.label}
    </Badge>
);

export const ExerciseTagList = ({ tagList, ...props }: { tagList: Tag[] } & WrapProps) => {
    return (
        <Wrap {...props}>
            {tagList.map((tag) => (
                <WrapItem key={tag.id}>
                    <ExerciseTag tag={tag} />
                </WrapItem>
            ))}
        </Wrap>
    );
};
