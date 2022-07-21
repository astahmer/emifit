import { groupBy } from "@/functions/groupBy";
import {
    Button,
    ButtonProps,
    Checkbox,
    Divider,
    List,
    ListItem,
    ListItemProps,
    ListProps,
    Stack,
    Text,
    useMergeRefs,
} from "@chakra-ui/react";
import { isDefined, ObjectLiteral } from "pastable";
import { useSelect, UseSelectProps, UseSelectReturnValue } from "downshift";
import { ForwardedRef, forwardRef, ReactNode, useCallback, useRef, useState } from "react";
import { useVirtual } from "react-virtual";

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps<any, true>>((props, ref) => (
    <MultiSelectBase {...props} externalRef={ref} />
)) as <Item, IsMulti extends boolean>(
    props: MultiSelectProps<Item, IsMulti> & { ref?: ForwardedRef<HTMLSelectElement> }
) => ReturnType<typeof MultiSelectBase>;

interface MultiSelectBaseProps<Item, IsMulti extends boolean = undefined> {
    externalRef?: ForwardedRef<HTMLSelectElement | null>;
    items: Item[];
    onChange: (items: undefined extends Item ? Item[] : true extends IsMulti ? Item[] : Item) => void;
    label?: (getLabelProps: UseSelectReturnValue<Item>["getLabelProps"]) => ReactNode;
    getValue?: (item: Item) => string;
    getButtonProps?: () => ButtonProps;
    isMulti?: IsMulti;
    renderButton?: (props: {
        getButtonProps: UseSelectReturnValue<Item>["getToggleButtonProps"];
        selectedItems: Item[];
    }) => ReactNode;
    renderButtonText?: (selection: undefined extends Item ? Item[] : true extends IsMulti ? Item[] : Item) => ReactNode;
    renderList?: (props: ListComponentProps<IsMulti, Item> & { ListComponent: typeof ListComponent }) => ReactNode;
    isOpen?: boolean;
    groupByKeyGetter?: (item: Item) => string;
    defaultValue?: true extends IsMulti ? Item[] : Item;
    value?: true extends IsMulti ? Item[] : Item;
    renderAfterOptionText?: (itemValue: string) => ReactNode;
}

export type MultiSelectProps<Item, IsMulti extends boolean = undefined> = MultiSelectBaseProps<Item, IsMulti> & {
    listProps?: ListProps;
} & Pick<UseSelectProps<Item>, "itemToString"> &
    Pick<ButtonProps, "onBlur">;

function MultiSelectBase<IsMulti extends boolean, Item = any>({
    externalRef,
    items,
    label,
    getValue = (item) => String(item as any),
    itemToString,
    onChange,
    onBlur,
    getButtonProps,
    isMulti = true as any,
    renderButton,
    renderButtonText,
    renderList,
    listProps,
    isOpen: isOpenProp,
    groupByKeyGetter,
    defaultValue,
    value,
    renderAfterOptionText,
}: MultiSelectProps<Item, IsMulti>) {
    const [innerSelection, setSelection] = useState((value ?? defaultValue ?? (isMulti ? [] : null)) as any[]);
    const isControlled = isDefined(value);
    const selection = (isControlled ? value : innerSelection) as any[];
    const parentRef = useRef();

    const { isOpen, getToggleButtonProps, getLabelProps, getMenuProps, highlightedIndex, getItemProps } =
        useSelect<Item>({
            isOpen: isOpenProp,
            ...(isMulti ? { stateReducer } : undefined),
            items,
            selectedItem: selection as any,
            onSelectedItemChange: ({ selectedItem }) => {
                if (!isMulti) return onChange(selectedItem as any);
                if (!selectedItem) return onChange(selectedItem as any);

                const index = selection.findIndex((selected) => getValue(selected) === getValue(selectedItem));
                let update: Item[];
                if (index > 0) {
                    update = [...selection.slice(0, index), ...selection.slice(index + 1)];
                } else if (index === 0) {
                    update = [...selection.slice(1)];
                } else {
                    update = [...selection, selectedItem];
                }

                if (!isControlled) {
                    setSelection(update);
                }

                onChange(update as any);
            },
        });

    const groupedItems = groupByKeyGetter ? groupBy(items, groupByKeyGetter) : {};
    const groups = Object.keys(groupedItems);
    const itemsWithGroups: typeof items = groupByKeyGetter
        ? groups.reduce((acc, k) => [...acc, k, ...groupedItems[k]], [])
        : items;

    const rowVirtualizer = useVirtual({
        size: itemsWithGroups.length,
        parentRef,
        estimateSize: useCallback(() => 35, []),
        overscan: 5,
    });

    const values = isMulti
        ? selection.map((v) => String(getValue(v)))
        : selection
        ? [String(getValue(selection as any))]
        : [];

    const menuProps = getMenuProps(listProps as any, { suppressRefError: true });
    const menuRef = useMergeRefs(parentRef, menuProps.ref);

    const buttonProps = getToggleButtonProps(getButtonProps?.() as any);
    const buttonRef = useMergeRefs(externalRef, buttonProps.ref);

    const listComponentProps = {
        isOpen,
        isMulti,
        menuProps,
        menuRef,
        rowVirtualizer,
        items,
        itemsWithGroups,
        itemToString,
        getValue,
        highlightedIndex,
        getItemProps,
        values,
        groups,
        renderAfterOptionText,
    };

    return (
        <>
            {label?.(getLabelProps)}
            {renderButton ? (
                renderButton({ getButtonProps: getToggleButtonProps, selectedItems: selection })
            ) : (
                <Button {...buttonProps} ref={buttonRef} onBlur={onBlur}>
                    {renderButtonText
                        ? renderButtonText(selection)
                        : selection.length
                        ? `${selection.length} elements selected`
                        : "Select one or more"}
                </Button>
            )}
            {renderList ? (
                renderList({ ...listComponentProps, ListComponent })
            ) : (
                <ListComponent {...listComponentProps} />
            )}
        </>
    );
}

const stateReducer: UseSelectProps<any>["stateReducer"] = (state, actionAndChanges) => {
    const { changes, type } = actionAndChanges;
    switch (type) {
        case useSelect.stateChangeTypes.MenuKeyDownEnter:
        case useSelect.stateChangeTypes.MenuKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
            return {
                ...changes,
                isOpen: true, // keep menu open after selection.
                highlightedIndex: state.highlightedIndex,
            };
        default:
            return changes;
    }
};
interface ListComponentProps<IsMulti extends boolean, Item = any>
    extends Pick<MultiSelectBaseProps<Item, IsMulti>, "items" | "isMulti" | "items" | "getValue" | "isOpen">,
        Pick<UseSelectProps<Item>, "itemToString"> {
    menuProps: ObjectLiteral;
    menuRef: (node: undefined) => void;
    rowVirtualizer: ReturnType<typeof useVirtual>;
    highlightedIndex: number;
    getItemProps: ReturnType<typeof useSelect>["getItemProps"];
    values: string[];
    groups: string[];
    itemsWithGroups: (Item | string)[];
    renderAfterOptionText?: (item: Item | string) => ReactNode;
}

function ListComponent<IsMulti extends boolean, Item = any>({
    isOpen,
    isMulti,
    menuProps,
    menuRef,
    rowVirtualizer,
    items,
    itemToString,
    getValue,
    highlightedIndex,
    getItemProps,
    values,
    groups,
    itemsWithGroups,
    renderAfterOptionText,
}: ListComponentProps<IsMulti, Item>) {
    const rows = rowVirtualizer.virtualItems;

    return (
        <List
            display={isOpen ? null : "none"}
            py={2}
            flex={1}
            mt={0}
            maxH="150px"
            {...menuProps}
            ref={menuRef}
            overflowY="auto"
        >
            <div
                style={{
                    height: `${rowVirtualizer.totalSize}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {rows.map((virtualRow) => {
                    const item = itemsWithGroups[virtualRow.index];
                    const label = typeof item === "string" ? item : itemToString(item);

                    if (groups.includes(label)) {
                        const value = item as any as string;
                        return (
                            <div
                                key={value}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {virtualRow.index > 0 && <Divider mt="2" />}
                                <SelectListItem fontWeight="bold" color="pink.300">
                                    <Text>{label}</Text>
                                </SelectListItem>
                            </div>
                        );
                    }

                    const value = String(getValue(item as Item));
                    const itemIndex = items.findIndex((i) => getValue(i) === value);

                    return (
                        <SelectListItem
                            key={value}
                            cursor="pointer"
                            bg={itemIndex === highlightedIndex ? "twitter.100" : null}
                            pos="relative"
                            {...getItemProps({
                                item,
                                index: itemIndex,
                                style: {
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                },
                            })}
                        >
                            {isMulti ? (
                                <Checkbox isChecked={values.includes(value)} value={value} pointerEvents="none" />
                            ) : null}
                            <Text>{label}</Text>
                            {renderAfterOptionText ? renderAfterOptionText(value) : null}
                        </SelectListItem>
                    );
                })}
            </div>
        </List>
    );
}

const SelectListItem = forwardRef<HTMLLIElement, ListItemProps>(({ children, ...props }: ListItemProps, ref) => {
    return (
        <ListItem ref={ref} transition="background-color 220ms, color 220ms" px={4} py={2} {...props}>
            <Stack direction="row">{children}</Stack>
        </ListItem>
    );
});
