import { RadioCard, RadioCardPicker, RadioCardPickerProps } from "@/components/RadioCard";
import { Categories } from "@/constants";

const options = Categories.map((cat) => cat);
export const CategoryRadioPicker = ({
    isOptionDisabled,
    ...props
}: { isOptionDisabled?: (option: typeof options[number]) => boolean } & Omit<
    RadioCardPickerProps,
    "renderOptions"
>) => (
    <RadioCardPicker
        {...props}
        renderOptions={(getRadioProps) =>
            options.map((option) => {
                const value = option.id;
                const radio = getRadioProps({ value });

                return (
                    <RadioCard key={value} {...radio} isDisabled={radio.disabled || isOptionDisabled?.(option)}>
                        {value}
                    </RadioCard>
                );
            })
        }
    />
);
