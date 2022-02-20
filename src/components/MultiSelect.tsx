import { Button, ButtonProps, Checkbox, List, ListItem, Stack, Text, useMergeRefs } from "@chakra-ui/react";
import { useSelect, UseSelectProps, UseSelectReturnValue } from "downshift";
import React, { ForwardedRef, forwardRef, ReactNode, useCallback, useRef, useState } from "react";
import { useVirtual } from "react-virtual";

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>((props, ref) => (
    <MultiSelectBase {...props} externalRef={ref} />
)) as <Item>(
    props: MultiSelectProps<Item> & { ref?: ForwardedRef<HTMLSelectElement> }
) => ReturnType<typeof MultiSelectBase>;

type MultiSelectProps<Item = any> = {
    externalRef?: ForwardedRef<HTMLSelectElement | null>;
    items: Item[];
    onChange: (items: Item[]) => void;
    label?: (getLabelProps: UseSelectReturnValue<Item>["getLabelProps"]) => ReactNode;
    getValue?: (item: Item) => string | number;
    getButtonProps?: () => ButtonProps;
} & Pick<UseSelectProps<Item>, "itemToString"> &
    Pick<ButtonProps, "onBlur">;

function MultiSelectBase<Item = any>({
    externalRef,
    items,
    label,
    getValue = (item) => String(item as any),
    itemToString,
    onChange,
    onBlur,
    getButtonProps,
}: MultiSelectProps<Item>) {
    const [selectedItems, setSelectedItems] = useState([]);
    const parentRef = useRef();

    const { isOpen, getToggleButtonProps, getLabelProps, getMenuProps, highlightedIndex, getItemProps } = useSelect({
        items,
        stateReducer,
        selectedItem: [] as any,
        onSelectedItemChange: ({ selectedItem }) => {
            if (!selectedItem) return;

            const index = selectedItems.findIndex((selected) => getValue(selected) === getValue(selectedItem));
            let update: Item[];
            if (index > 0) {
                update = [...selectedItems.slice(0, index), ...selectedItems.slice(index + 1)];
            } else if (index === 0) {
                update = [...selectedItems.slice(1)];
            } else {
                update = [...selectedItems, selectedItem];
            }

            setSelectedItems(update);
            onChange?.(update);
        },
    });

    const values = selectedItems.map((v) => String(getValue(v)));
    const rowVirtualizer = useVirtual({
        size: items.length,
        parentRef,
        estimateSize: useCallback(() => 35, []),
        overscan: 5,
    });

    const buttonProps = getToggleButtonProps(getButtonProps?.() as any);
    const buttonRef = useMergeRefs(externalRef, buttonProps.ref);

    return (
        <>
            {label?.(getLabelProps)}
            <Button {...buttonProps} ref={buttonRef} onBlur={onBlur}>
                {selectedItems.length ? `${selectedItems.length} elements selected` : "Select one or more"}
            </Button>
            <List
                display={isOpen ? null : "none"}
                py={2}
                {...getMenuProps({ ref: parentRef })}
                flex={1}
                overflowY="auto"
                mt={0}
                maxH="150px"
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
                                    <Checkbox isChecked={values.includes(value)} value={value} onChange={() => null} />
                                    <Text>{label}</Text>
                                </Stack>
                            </ListItem>
                        );
                    })}
                </div>
            </List>
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
