import { RadioCard, RadioCardPicker, RadioCardPickerProps } from "@/components/RadioCard";
import { useCategoryList } from "@/orm-hooks";
import { Category } from "@/orm-types";

export const CategoryRadioPicker = ({
    isOptionDisabled,
    ...props
}: { isOptionDisabled?: (option: Category) => boolean } & Omit<RadioCardPickerProps, "renderOptions">) => {
    const options = useCategoryList();

    return (
        <RadioCardPicker
            {...props}
            getStackProps={() => ({
                scrollSnapType: "x mandatory",
                overflowX: "auto",
                overflowY: "hidden",
                css: { "::-webkit-scrollbar": { height: "2px" } },
                flexShrink: 0,
                px: 4,
                scrollPaddingX: 4,
            })}
            renderOptions={(getRadioProps) =>
                options.map((option) => {
                    const value = option.id;
                    const radio = getRadioProps({ value });

                    return (
                        <RadioCard
                            key={value}
                            {...radio}
                            isDisabled={radio.disabled || isOptionDisabled?.(option) || props.isDisabled}
                            getLabelProps={() => ({ scrollSnapAlign: "start", mb: "var(--chakra-space-2) !important" })}
                            getButtonProps={() => {
                                return {
                                    ...(radio.isChecked && {
                                        bgColor: option.color,
                                        borderColor: option.color,
                                        _focus: { bgColor: option.color, borderColor: option.color },
                                        _active: { bgColor: option.color, borderColor: option.color },
                                        _hover: { bgColor: option.color, borderColor: option.color },
                                    }),
                                };
                            }}
                        >
                            {option.name}
                        </RadioCard>
                    );
                })
            }
        />
    );
};
