import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
    Flex,
    forwardRef,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    List,
    ListItem,
    useMergeRefs,
} from "@chakra-ui/react";
import { useCombobox, UseComboboxReturnValue } from "downshift";
import { ReactNode, Ref, useState } from "react";

export const Combobox = forwardRef(
    (
        {
            items,
            renderInput,
            label,
        }: {
            items: string[];
            renderInput?: (
                props: { ref: Ref<HTMLInputElement> } & ReturnType<UseComboboxReturnValue<string>["getInputProps"]>
            ) => ReactNode;
            label?: (getLabelProps: UseComboboxReturnValue<string>["getLabelProps"]) => ReactNode;
        },
        ref
    ) => {
        const [inputItems, setInputItems] = useState(items);
        const {
            isOpen,
            getToggleButtonProps,
            getLabelProps,
            getMenuProps,
            getInputProps,
            getComboboxProps,
            highlightedIndex,
            getItemProps,
            inputValue,
        } = useCombobox({
            items: inputItems,

            onInputValueChange: ({ inputValue }) => {
                setInputItems(items.filter((item) => item.toLowerCase().startsWith(inputValue.toLowerCase())));
            },
            onSelectedItemChange: (changes) => console.log(changes),
        });
        // TODO merge ici
        const inputProps = getInputProps();
        const inputRef = useMergeRefs(ref, inputProps.ref);

        return (
            <>
                {label?.(getLabelProps)}
                <Flex {...getComboboxProps()} direction="column">
                    <InputGroup>
                        {renderInput ? (
                            renderInput({ ...inputProps, ref: inputRef })
                        ) : (
                            <Input ref={inputRef} {...inputProps} placeholder="Search..." />
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
                    <List display={isOpen ? null : "none"} py={2} {...getMenuProps()} flex={1} overflowY="auto" mt={0}>
                        {inputItems.map((item, index) => (
                            <ListItem
                                transition="background-color 220ms, color 220ms"
                                bg={index === highlightedIndex ? "twitter.100" : null}
                                px={4}
                                py={2}
                                cursor="pointer"
                                {...getItemProps({ item, index })}
                                key={index}
                            >
                                {item}
                            </ListItem>
                        ))}
                    </List>
                </Flex>
            </>
        );
    }
);
