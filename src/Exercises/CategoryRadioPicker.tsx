import { RadioCard } from "@/components/RadioCard";
import { Categories } from "@/constants";
import { Stack, useRadioGroup, UseRadioGroupProps } from "@chakra-ui/react";

const options = Categories.map((cat) => cat);
export function CategoryRadioPicker({ onChange, isDisabled }: Pick<UseRadioGroupProps, "onChange" | "isDisabled">) {
    const { getRootProps, getRadioProps } = useRadioGroup({ name: "category", onChange, isDisabled });

    return (
        <Stack direction="row" {...getRootProps()} textAlign="center" justifyContent="space-around" w="100%">
            {options.map((option) => {
                const value = option.id;
                const radio = getRadioProps({ value });

                return (
                    <RadioCard key={value} {...radio}>
                        {value}
                    </RadioCard>
                );
            })}
        </Stack>
    );
}
