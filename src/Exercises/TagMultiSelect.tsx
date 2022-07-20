import { MultiSelect, MultiSelectProps } from "@/fields/MultiSelect";
import { mergeProps } from "@/functions/mergeProps";
import { Tag } from "@/orm-types";
import { PickOptional } from "@/types";
import { FormControl, FormErrorMessage, FormLabel, Text } from "@chakra-ui/react";
import { Controller, ControllerProps } from "react-hook-form";

export function TagMultiSelect({
    items,
    error,
    name,
    control,
    defaultValue,
    required,
    rules,
    label,
    ...props
}: Omit<ControllerProps<any>, "render"> & {
    error?: string;
    required?: boolean;
} & Omit<
        MultiSelectProps<Tag, true>,
        "getValue" | "itemToString" | "groupByKeyGetter" | "getButtonProps" | "renderButtonText" | "onChange"
    > &
    PickOptional<MultiSelectProps<Tag, true>, "onChange">) {
    const isInvalid = Boolean(error);

    return (
        <FormControl isInvalid={isInvalid}>
            <Controller
                {...{ name, control, defaultValue, required, rules }}
                render={({ field: { ref, ...controllerProps } }) => (
                    <MultiSelect
                        {...mergeProps(props, controllerProps)}
                        defaultValue={defaultValue}
                        ref={ref}
                        getValue={(item) => item.id}
                        itemToString={(item) => item.name}
                        groupByKeyGetter={(item) => item.groupId}
                        items={items}
                        label={
                            label ||
                            ((getLabelProps) => (
                                <FormLabel {...getLabelProps()}>Tags{required || rules?.required ? "*" : ""}</FormLabel>
                            ))
                        }
                        getButtonProps={() => ({
                            w: "100%",
                            "aria-invalid": isInvalid,
                            // colorScheme: "pink",
                            // variant: "outline",
                            _invalid: { borderWidth: "1px", borderColor: "red.500", boxShadow: `0 0 0 1px #e53e3e` },
                        })}
                        renderButtonText={(selection) => (
                            <Text maxW="100%" textOverflow="ellipsis" overflow="hidden">
                                {selection.length
                                    ? `(${selection.length}) ${selection.map((item) => item.name).join(", ")}`
                                    : "Select one or more tags"}
                            </Text>
                        )}
                    />
                )}
            />

            {error && <FormErrorMessage>{error as any}</FormErrorMessage>}
        </FormControl>
    );
}
