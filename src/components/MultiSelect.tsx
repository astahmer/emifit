import { Button, ButtonProps, Checkbox, List, ListItem, ListProps, Stack, Text, useMergeRefs } from "@chakra-ui/react";
import { ObjectLiteral } from "@pastable/core";
import { useSelect, UseSelectProps, UseSelectReturnValue } from "downshift";
import React, { ForwardedRef, forwardRef, ReactNode, useCallback, useRef, useState } from "react";
import { useVirtual } from "react-virtual";

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps<any, true>>((props, ref) => (
    <MultiSelectBase {...props} externalRef={ref} />
)) as <Item, IsMulti extends boolean>(
    props: MultiSelectProps<Item, IsMulti> & { ref?: ForwardedRef<HTMLSelectElement> }
) => ReturnType<typeof MultiSelectBase>;

type MultiSelectProps<Item, IsMulti extends boolean = undefined> = {
    externalRef?: ForwardedRef<HTMLSelectElement | null>;
    items: Item[];
    onChange: (items: undefined extends Item ? Item[] : true extends IsMulti ? Item[] : Item) => void;
    label?: (getLabelProps: UseSelectReturnValue<Item>["getLabelProps"]) => ReactNode;
    getValue?: (item: Item) => string | number;
    getButtonProps?: () => ButtonProps;
    isMulti?: IsMulti;
    renderButton?: (props: {
        getButtonProps: UseSelectReturnValue<Item>["getToggleButtonProps"];
        selectedItems: Item[];
    }) => ReactNode;
    renderButtonText?: (selection: undefined extends Item ? Item[] : true extends IsMulti ? Item[] : Item) => ReactNode;
    renderList?: (props: ListComponentProps<Item> & { ListComponent: typeof ListComponent }) => ReactNode;
    listProps?: ListProps;
    isOpen?: boolean;
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
}: MultiSelectProps<Item, IsMulti>) {
    const [selection, setSelection] = useState(isMulti ? [] : null);
    const parentRef = useRef();

    const { isOpen, getToggleButtonProps, getLabelProps, getMenuProps, highlightedIndex, getItemProps } =
        useSelect<Item>({
            isOpen: isOpenProp,
            ...(isMulti ? { stateReducer } : undefined),
            items,
            selectedItem: isMulti ? ([] as any) : (null as Item),
            onSelectedItemChange: ({ selectedItem }) => {
                if (!isMulti) return onChange(selectedItem as any);
                if (!selectedItem) return;

                const index = selection.findIndex((selected) => getValue(selected) === getValue(selectedItem));
                let update: Item[];
                if (index > 0) {
                    update = [...selection.slice(0, index), ...selection.slice(index + 1)];
                } else if (index === 0) {
                    update = [...selection.slice(1)];
                } else {
                    update = [...selection, selectedItem];
                }

                setSelection(update);
                onChange(update as any);
            },
        });

    const values = isMulti
        ? selection.map((v) => String(getValue(v)))
        : selection
        ? [String(getValue(selection as any))]
        : [];
    const rowVirtualizer = useVirtual({
        size: items.length,
        parentRef,
        estimateSize: useCallback(() => 35, []),
        overscan: 5,
    });
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
        itemToString,
        getValue,
        highlightedIndex,
        getItemProps,
        values,
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
interface ListComponentProps<Item = any> {
    isOpen: boolean;
    isMulti: boolean;
    menuProps: ObjectLiteral;
    menuRef: (node: undefined) => void;
    rowVirtualizer: ReturnType<typeof useVirtual>;
    items: Item[];
    itemToString: (item: Item) => string;
    getValue: (item: Item) => string | number;
    highlightedIndex: number;
    getItemProps: ReturnType<typeof useSelect>["getItemProps"];
    values: string[];
}

function ListComponent<Item = any>({
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
}: ListComponentProps<Item>) {
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
                {rowVirtualizer.virtualItems.map((virtualRow) => {
                    const item = items[virtualRow.index];
                    const label = typeof item === "string" ? item : itemToString(item);
                    const value = String(getValue(item));

                    return (
                        <ListItem
                            transition="background-color 220ms, color 220ms"
                            bg={virtualRow.index === highlightedIndex ? "twitter.100" : null}
                            px={4}
                            py={2}
                            cursor="pointer"
                            {...getItemProps({
                                item: item,
                                index: virtualRow.index,
                                style: {
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                },
                            })}
                            key={value}
                        >
                            <Stack direction="row">
                                {isMulti ? (
                                    <Checkbox isChecked={values.includes(value)} value={value} onChange={() => null} />
                                ) : null}
                                <Text>{label}</Text>
                            </Stack>
                        </ListItem>
                    );
                })}
            </div>
        </List>
    );
}
