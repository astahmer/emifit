import { mergeProps } from "@/functions/mergeProps";
import {
    forwardRef,
    IconButton,
    IconButtonProps,
    Menu,
    MenuButton,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
} from "@chakra-ui/react";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";

export const SortByIconButton = forwardRef(
    (
        {
            sortByDirection,
            onSortByDirectionChange,
            ...props
        }: {
            sortByDirection?: SortByDirection;
            onSortByDirectionChange?: (direction: SortByDirection) => void;
        } & Partial<IconButtonProps>,
        ref
    ) => (
        <IconButton
            ref={ref}
            aria-label="Sort"
            icon={sortByDirection === "desc" ? <HiSortAscending /> : <HiSortDescending />}
            {...mergeProps(props, {
                onClick: () => onSortByDirectionChange?.(sortByDirection === "asc" ? "desc" : "asc"),
            })}
        />
    )
);

export type SortByDirection = "asc" | "desc";

export const SortByMenu = () => (
    <Menu>
        <MenuButton as={SortByIconButton} variant="outline" ml="auto">
            Actions
        </MenuButton>
        <MenuList defaultValue="name-asc">
            <MenuOptionGroup defaultValue="name-asc" title="Sort by" type="radio">
                <MenuItemOption value="name-asc">Name (A to Z)</MenuItemOption>
                <MenuItemOption value="name-desc">Name (Z to A)</MenuItemOption>
                <MenuItemOption value="date-asc">Newest first</MenuItemOption>
                <MenuItemOption value="date-desc">Oldest first</MenuItemOption>
            </MenuOptionGroup>
        </MenuList>
    </Menu>
);
