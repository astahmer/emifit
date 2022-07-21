import { mergeProps } from "@/functions/mergeProps";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
    Flex,
    IconButton,
    Input,
    InputGroup,
    InputProps,
    InputRightElement,
    List,
    ListItem,
    Tag,
    TagCloseButton,
    TagLabel,
    useMergeRefs,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import {
    useCombobox,
    UseComboboxProps,
    UseComboboxReturnValue,
    useMultipleSelection,
    UseMultipleSelectionProps,
    UseMultipleSelectionReturnValue,
} from "downshift";
import { ForwardedRef, forwardRef, ReactNode, Ref, useCallback, useMemo, useRef, useState } from "react";
import { useVirtual } from "react-virtual";

export const MultiCombobox = forwardRef<HTMLInputElement, MultiComboboxProps>((props, ref) => (
    <MultiComboboxBase {...props} externalRef={ref} />
)) as <Item>(
    props: MultiComboboxProps<Item> & { ref?: ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof MultiComboboxBase>;

export type MultiComboboxProps<Item = any> = {
    externalRef?: ForwardedRef<HTMLInputElement | null>;
    items: Item[];
    renderInput?: (
        props: { ref: Ref<HTMLInputElement> } & ReturnType<UseComboboxReturnValue<Item>["getInputProps"]>
    ) => ReactNode;
    label?: (getLabelProps: UseComboboxReturnValue<Item>["getLabelProps"]) => ReactNode;
    getValue?: (item: Item) => string | number;
    renderRight?: () => ReactNode;
    minItems?: number;
    getSuggestions?: (props: {
        inputValue: string;
        inputItems: Item[];
        selectedItems: Item[];
        values: (string | number)[];
    }) => Item[];
} & InputProps &
    Pick<UseComboboxProps<Item>, "itemToString" | "onSelectedItemChange"> &
    Pick<UseMultipleSelectionProps<Item>, "onSelectedItemsChange" | "initialSelectedItems"> &
    Partial<Pick<UseMultipleSelectionReturnValue<Item>, "getSelectedItemProps">>;

function MultiComboboxBase<Item = any>({
    externalRef,
    items,
    renderInput,
    label,
    getValue = (item) => String(item as any),
    itemToString = (item) => String(item as any),
    onSelectedItemChange,
    onSelectedItemsChange,
    renderRight,
    initialSelectedItems,
    minItems,
    getSuggestions,
    getSelectedItemProps: getSelectedItemPropsProp,
    ...props
}: MultiComboboxProps<Item>) {
    const { getSelectedItemProps, getDropdownProps, addSelectedItem, removeSelectedItem, selectedItems } =
        useMultipleSelection({ initialSelectedItems: initialSelectedItems || [], onSelectedItemsChange });

    const inputValueRef = useRef<string>("");
    const [inputItems, setInputItems] = useState(items);
    const values = selectedItems.map(getValue);
    const suggestions = getSuggestions
        ? getSuggestions({ inputValue: inputValueRef.current, inputItems, selectedItems, values })
        : inputItems.filter((item) => !values.includes(getValue(item)));

    const parentRef = useRef();
    const rowVirtualizer = useVirtual({
        size: suggestions.length,
        parentRef,
        estimateSize: useCallback(() => 35, []),
        overscan: 5,
    });

    // fill inputValue with getValue(item) if defined
    const stateReducer = useMemo(() => {
        if (!getValue) return undefined;
        const reducer: UseComboboxProps<Item>["stateReducer"] = (state, actionAndChanges) => {
            const { type, changes } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    return {
                        ...changes,
                        isOpen: true,
                        ...(state.highlightedIndex > -1 &&
                            changes.selectedItem && {
                                inputValue: String(itemToString(changes.selectedItem)),
                            }),
                    };
                default:
                    return changes;
            }
        };

        return reducer;
    }, [getValue]);

    const combobox = useCombobox({
        defaultHighlightedIndex: 0, // after selection, highlight the first item.
        selectedItem: null,
        stateReducer,
        itemToString,
        items: suggestions,
        onInputValueChange: ({ inputValue }) => {
            inputValueRef.current = inputValue;
            setInputItems(
                items.filter((item) =>
                    (typeof item === "string" ? item : itemToString(item))
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                )
            );
        },
        onSelectedItemChange,
        onStateChange: ({ type, selectedItem }) => {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.InputBlur:
                    if (!selectedItem) break;

                    const isAlreadySelected = values.includes(getValue(selectedItem));
                    if (isAlreadySelected) break;

                    setInputValue("");
                    addSelectedItem(selectedItem);
                    break;
                default:
                    break;
            }
        },
    });
    const {
        isOpen,
        getToggleButtonProps,
        getLabelProps,
        getMenuProps,
        getInputProps,
        getComboboxProps,
        highlightedIndex,
        getItemProps,
        setInputValue,
    } = combobox;

    const isDisabled = items.length === values.length;

    const inputProps = getInputProps(getDropdownProps({ preventKeyAction: isOpen }));
    const inputRef = useMergeRefs(externalRef, inputProps.ref);

    const canRemoveItems = minItems ? values.length > minItems : values.length > 0;

    return (
        <>
            {label?.(getLabelProps)}
            <Wrap>
                {selectedItems.map((item, index) => (
                    <WrapItem
                        key={getValue(item)}
                        {...mergeProps(
                            getSelectedItemProps({ selectedItem: item, index }),
                            getSelectedItemPropsProp?.({ selectedItem: item, index }) || {}
                        )}
                    >
                        <Tag size="lg" colorScheme="pink" borderRadius="full" variant="subtle">
                            <TagLabel>{typeof item === "string" ? item : itemToString(item)}</TagLabel>
                            {canRemoveItems && <TagCloseButton onClick={() => removeSelectedItem(item)} />}
                        </Tag>
                    </WrapItem>
                ))}
                <WrapItem display="flex" alignItems="center" w="100%">
                    <Flex {...getComboboxProps()} direction="column" w="100%">
                        <InputGroup w="100%">
                            {renderInput ? (
                                renderInput({ ...inputProps, ref: inputRef })
                            ) : (
                                <Input
                                    placeholder={items.length ? "Search or create a new one..." : "Create a new one..."}
                                    disabled={isDisabled}
                                    {...mergeProps(mergeProps(inputProps, props), {
                                        onFocus: () => !combobox.isOpen && combobox.openMenu(),
                                    })}
                                    ref={inputRef}
                                />
                            )}
                            {items.length && (
                                <InputRightElement>
                                    <IconButton
                                        disabled={isDisabled}
                                        {...getToggleButtonProps()}
                                        size="sm"
                                        aria-label={"toggle menu"}
                                        colorScheme={isOpen ? "gray" : "pink"}
                                        icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    />
                                </InputRightElement>
                            )}
                        </InputGroup>
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
                                {rowVirtualizer.virtualItems.map((virtualRow) => (
                                    <ListItem
                                        transition="background-color 220ms, color 220ms"
                                        bg={virtualRow.index === highlightedIndex ? "twitter.100" : null}
                                        px={4}
                                        py={2}
                                        cursor="pointer"
                                        {...getItemProps({
                                            item: suggestions[virtualRow.index],
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
                                        key={getValue(suggestions[virtualRow.index])}
                                    >
                                        {typeof suggestions[virtualRow.index] === "string"
                                            ? suggestions[virtualRow.index]
                                            : itemToString(suggestions[virtualRow.index])}
                                    </ListItem>
                                ))}
                            </div>
                        </List>
                    </Flex>
                </WrapItem>
                {renderRight?.()}
            </Wrap>
        </>
    );
}
