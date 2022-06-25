import { Carousel } from "@/components/Carousel";
import { RadioCard, RadioCardPickerProps } from "@/components/RadioCard";
import { useCategoryList } from "@/orm-hooks";
import { Category } from "@/orm-types";
import { Stack, useRadioGroup } from "@chakra-ui/react";

export const CategoryRadioPicker = ({
    isOptionDisabled,
    ...props
}: { isOptionDisabled?: (option: Category) => boolean } & Omit<RadioCardPickerProps, "renderOptions">) => {
    const radioGroup = useRadioGroup({ ...props, name: "category" });
    const { getRootProps, getRadioProps } = radioGroup;
    const options = useCategoryList();

    return (
        <Stack direction="row" {...getRootProps()} textAlign="center" w="100%">
            <Carousel
                items={options}
                defaultIndex={props.defaultValue && options.findIndex((opt) => opt.id === props.defaultValue)}
                controlledIndex={props.value && options.findIndex((opt) => opt.id === props.value)}
                config={{ useAvailableSpace: false }}
                renderItems={({ isDragging, activeIndex, itemRefMap }) =>
                    options.map((option, index) => {
                        const value = option.id;
                        const radio = getRadioProps({ value });

                        return (
                            <RadioCard
                                key={value}
                                {...radio}
                                isDisabled={radio.disabled || isOptionDisabled?.(option) || props.isDisabled}
                                ref={(ref) => itemRefMap.set(index, ref)}
                                getButtonProps={() => {
                                    return {
                                        mx: "1",
                                        ...(radio.isChecked && {
                                            bgColor: option.color,
                                            borderColor: option.color,
                                            _focus: { bgColor: option.color, borderColor: option.color },
                                            _active: { bgColor: option.color, borderColor: option.color },
                                            _hover: { bgColor: option.color, borderColor: option.color },
                                        }),
                                        style: {
                                            transform: isDragging
                                                ? `scale(${activeIndex === index ? 1.2 : 1})`
                                                : undefined,
                                            opacity: isDragging && activeIndex === index ? 1 : undefined,
                                        },
                                    };
                                }}
                            >
                                {option.name}
                            </RadioCard>
                        );
                    })
                }
            />
        </Stack>
    );
};
