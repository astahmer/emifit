import { RadioCard, RadioCardPicker, RadioCardPickerProps } from "@/components/RadioCard";
import { Categories } from "@/constants";

const options = Categories.map((cat) => cat);
export const CategoryRadioPicker = ({ renderOptions, ...props }: RadioCardPickerProps) => (
    <RadioCardPicker
        {...props}
        renderOptions={(getRadioProps) =>
            options.map((option) => {
                const value = option.id;
                const radio = getRadioProps({ value });

                return (
                    <RadioCard key={value} {...radio}>
                        {value}
                    </RadioCard>
                );
            })
        }
    />
);
