import { MultiSelect, MultiSelectProps } from "@/components/MultiSelect";
import { Categories } from "@/constants";
import { Tag } from "@/orm-types";
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { Controller, ControllerProps } from "react-hook-form";

export function TagMultiSelect({
    catId,
    error,
    name,
    control,
    defaultValue,
    required,
    rules,
    ...props
}: Omit<ControllerProps<any>, "render"> & {
    catId: string;
    error?: string;
    required?: boolean;
} & Omit<
        MultiSelectProps<Tag, true>,
        | "getValue"
        | "itemToString"
        | "groupByKeyGetter"
        | "items"
        | "label"
        | "getButtonProps"
        | "renderButtonText"
        | "onChange"
    >) {
    const isInvalid = Boolean(error);
    const category = Categories.find((cat) => cat.id === (catId as typeof Categories[number]["id"]));
    const items = category.children as any as Array<Tag>;

    return (
        <FormControl isInvalid={isInvalid}>
            <Controller
                {...{ name, control, defaultValue, required, rules }}
                render={({ field: { ref, ...controllerProps } }) => (
                    <MultiSelect
                        {...props}
                        {...controllerProps}
                        defaultValue={defaultValue}
                        ref={ref}
                        getValue={(item) => item.id}
                        itemToString={(item) => item.label}
                        groupByKeyGetter={(item) => item.group}
                        items={items}
                        label={(getLabelProps) => <FormLabel {...getLabelProps()}>Tags</FormLabel>}
                        getButtonProps={() => ({
                            "aria-invalid": isInvalid,
                            _invalid: { borderWidth: "1px", borderColor: "red.500", boxShadow: `0 0 0 1px #e53e3e` },
                        })}
                        renderButtonText={(selection) =>
                            selection.length
                                ? `(${selection.length}) ${selection.map((item) => item.label).join(", ")}`
                                : "Select one or more tags"
                        }
                    />
                )}
            />

            {error && <FormErrorMessage>{error as any}</FormErrorMessage>}
        </FormControl>
    );
}
