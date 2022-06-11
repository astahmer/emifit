import { Carousel } from "@/components/Carousel";
import { RadioCard, RadioCardPickerProps } from "@/components/RadioCard";
import { useCategoryList } from "@/orm-hooks";
import { Category } from "@/orm-types";
import { Stack, useRadioGroup } from "@chakra-ui/react";

export const CategoryRadioPicker = ({
    isOptionDisabled,
    ...props
}: { isOptionDisabled?: (option: Category) => boolean } & Omit<RadioCardPickerProps, "renderOptions">) => {
    const { getRootProps, getRadioProps } = useRadioGroup({ ...props, name: "category" });
    const options = useCategoryList();

    return (
        <Stack direction="row" {...getRootProps()} textAlign="center" justifyContent="space-around" w="100%">
            <Carousel
                items={options}
                defaultIndex={props.defaultValue && options.findIndex((opt) => opt.id === props.defaultValue)}
                renderItems={({ isDragging, activeIndex, itemRefMap }) => (
                    <Stack direction="row">
                        {options.map((option, index) => {
                            const value = option.id;
                            const radio = getRadioProps({ value });

                            return (
                                <RadioCard
                                    key={value}
                                    {...radio}
                                    isDisabled={radio.disabled || isOptionDisabled?.(option) || props.isDisabled}
                                    ref={(ref) => itemRefMap.set(index, ref)}
                                    getButtonProps={() => ({
                                        mx: "1",
                                        style: {
                                            transform: isDragging
                                                ? `scale(${activeIndex === index ? 1.2 : 1})`
                                                : undefined,
                                            opacity: isDragging && activeIndex === index ? 1 : undefined,
                                        },
                                    })}
                                >
                                    {value}
                                </RadioCard>
                            );
                        })}
                    </Stack>
                )}
            />
        </Stack>
    );
};
