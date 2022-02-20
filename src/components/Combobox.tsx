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
    useMergeRefs,
} from "@chakra-ui/react";
import { callAll } from "@pastable/core";
import { useCombobox, UseComboboxProps, UseComboboxReturnValue } from "downshift";
import { ForwardedRef, forwardRef, ReactNode, Ref, useCallback, useMemo, useRef, useState } from "react";
import { useVirtual } from "react-virtual";

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => (
    <ComboboxBase {...props} externalRef={ref} />
)) as <Item>(props: ComboboxProps<Item> & { ref?: ForwardedRef<HTMLInputElement> }) => ReturnType<typeof ComboboxBase>;

type ComboboxProps<Item = any> = {
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
    getValue,
    itemToString,
    onSelectedItemChange,
    ...props
}: ComboboxProps<Item>) {
    const [inputItems, setInputItems] = useState(items);
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
                                inputValue: String(getValue(changes.selectedItem)),
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
    } = useCombobox({
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
    const inputProps = getInputProps();
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
                    <InputRightElement>
                        <IconButton
                            {...getToggleButtonProps()}
                            size="sm"
                            aria-label={"toggle menu"}
                            colorScheme={isOpen ? "gray" : "twitter"}
                            icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        />
                    </InputRightElement>
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
                                key={
                                    typeof inputItems[virtualRow.index] === "string"
                                        ? inputItems[virtualRow.index]
                                        : itemToString(inputItems[virtualRow.index])
                                }
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
