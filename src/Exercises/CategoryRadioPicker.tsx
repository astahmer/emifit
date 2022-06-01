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
            renderOptions={(getRadioProps) =>
                options.map((option) => {
                    const value = option.id;
                    const radio = getRadioProps({ value });

                    return (
                        <RadioCard
                            key={value}
                            {...radio}
                            isDisabled={radio.disabled || isOptionDisabled?.(option) || props.isDisabled}
                        >
                            {value}
                        </RadioCard>
                    );
                })
            }
        />
    );
};
