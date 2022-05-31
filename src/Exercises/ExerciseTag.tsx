import { Tag } from "@/orm-types";
import { Badge, BadgeProps, Wrap, WrapItem, WrapProps } from "@chakra-ui/react";

export const ExerciseTag = ({ tag, ...props }: { tag: Tag } & BadgeProps) => (
    <Badge key={tag.id} variant="subtle" colorScheme="pink" fontSize="xx-small" {...props}>
        {tag.label}
    </Badge>
);

export const ExerciseTagList = ({
    tagList,
    isHidden,
    ...props
}: { tagList: Tag[]; isHidden?: boolean } & WrapProps) => {
    return (
        <Wrap {...props}>
            {tagList.slice(0, isHidden ? 2 : undefined).map((tag) => (
                <WrapItem key={tag.id}>
                    <ExerciseTag tag={tag} />
                </WrapItem>
            ))}
            {isHidden && tagList.length > 2 ? (
                <WrapItem>
                    <ExerciseTag tag={{ id: "...", label: "...", group: "none" }} />
                </WrapItem>
            ) : null}
        </Wrap>
    );
};
