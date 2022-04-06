import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "@chakra-ui/icons";
import {
    ButtonGroup,
    Flex,
    IconButton,
    Input,
    InputGroup,
    InputProps,
    InputRightElement,
    List,
    ListItem,
    useMergeRefs,
} from "@chakra-ui/react";
import { callAll } from "@pastable/core";
import { useCombobox, UseComboboxProps, UseComboboxReturnValue } from "downshift";
import { ForwardedRef, forwardRef, ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtual } from "react-virtual";

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => (
    <ComboboxBase {...props} externalRef={ref} />
)) as <Item>(props: ComboboxProps<Item> & { ref?: ForwardedRef<HTMLInputElement> }) => ReturnType<typeof ComboboxBase>;

export type ComboboxProps<Item = any> = {
    externalRef?: ForwardedRef<HTMLInputElement | null>;
    items: Item[];
    renderInput?: (
        props: { ref: Ref<HTMLInputElement> } & ReturnType<UseComboboxReturnValue<Item>["getInputProps"]>
    ) => ReactNode;
    label?: (getLabelProps: UseComboboxReturnValue<Item>["getLabelProps"]) => ReactNode;
    getValue?: (item: Item) => string | number;
} & InputProps &
    Pick<UseComboboxProps<Item>, "itemToString" | "onSelectedItemChange">;

function ComboboxBase<Item = any>({
    externalRef,
    items,
    renderInput,
    label,
    getValue = (item) => String(item as any),
    itemToString = (item) => String(item as any),
    onSelectedItemChange,
    defaultValue,
    ...props
}: ComboboxProps<Item>) {
    const [inputItems, setInputItems] = useState(items);
    useEffect(() => setInputItems(items), [items]);

    const parentRef = useRef();

    const rowVirtualizer = useVirtual({
        size: inputItems.length,
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

    const {
        isOpen,
        getToggleButtonProps,
        getLabelProps,
        getMenuProps,
        getInputProps,
        getComboboxProps,
        highlightedIndex,
        getItemProps,
        openMenu,
        selectItem,
        selectedItem,
    } = useCombobox({
        initialInputValue: defaultValue as string,
        stateReducer,
        itemToString,
        items: inputItems,
        onInputValueChange: ({ inputValue }) => {
            setInputItems(
                items.filter((item) =>
                    (typeof item === "string" ? item : itemToString(item))
                        .toLowerCase()
                        .startsWith(inputValue.toLowerCase())
                )
            );
        },
        onSelectedItemChange,
    });
    const inputProps = getInputProps({
        onFocus: () => {
            if (!isOpen) {
                openMenu();
            }
        },
    });
    const inputRef = useMergeRefs(externalRef, inputProps.ref);
    const mergedProps = {
        onChange: callAll(props.onChange, inputProps.onChange),
        onBlur: callAll(props.onBlur, inputProps.onBlur),
    };

    return (
        <>
            {label?.(getLabelProps)}
            <Flex {...getComboboxProps()} direction="column">
                <InputGroup>
                    {renderInput ? (
                        renderInput({ ...inputProps, ref: inputRef })
                    ) : (
                        <Input
                            placeholder="Search or create a new one..."
                            {...inputProps}
                            {...props}
                            {...mergedProps}
                            ref={inputRef}
                        />
                    )}
                    <InputRightElement w="auto" mr="2">
                        <ButtonGroup>
                            {Boolean(selectedItem) && (
                                <IconButton
                                    tabIndex={-1}
                                    onClick={() => selectItem(null)}
                                    aria-label="clear selection"
                                    size="sm"
                                    colorScheme={isOpen ? "gray" : "pink"}
                                    variant="outline"
                                    icon={<CloseIcon />}
                                    fontSize="xx-small"
                                />
                            )}
                            <IconButton
                                {...getToggleButtonProps()}
                                aria-label="toggle menu"
                                size="sm"
                                colorScheme={isOpen ? "gray" : "pink"}
                                icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                fontSize="md"
                            />
                        </ButtonGroup>
                    </InputRightElement>
                </InputGroup>
                <List
                    display={isOpen && rowVirtualizer.virtualItems.length ? null : "none"}
                    py={2}
                    {...getMenuProps({ ref: parentRef })}
                    flex={1}
                    overflowY="auto"
                    mt={0}
                    maxH="150px"
                    borderWidth="1px"
                    borderTopWidth="0"
                    borderColor="pink.200"
                    borderBottomRadius="md"
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
                                    item: inputItems[virtualRow.index],
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
                                key={getValue(inputItems[virtualRow.index])}
                            >
                                {typeof inputItems[virtualRow.index] === "string"
                                    ? inputItems[virtualRow.index]
                                    : itemToString(inputItems[virtualRow.index])}
                            </ListItem>
                        ))}
                    </div>
                </List>
            </Flex>
        </>
    );
}
