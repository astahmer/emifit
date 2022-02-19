import { Combobox } from "@/components/Combobox";
import { MobileNumberInput, MobileNumberInputProps } from "@/components/MobileNumberInput";
import { TextInput, TextInputProps } from "@/components/TextInput";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Divider, Flex, Heading, Input, InputProps, Stack, Text } from "@chakra-ui/react";
import { callAll, makeArrayOf } from "@pastable/core";
import { Fragment, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useFormContext, UseFormProps, UseFormReturn, useWatch } from "react-hook-form";
import { proxy, snapshot } from "valtio";

const defaultValues = { exoName: "", nbSeries: 1, nbRepsBySeries: 1 };
const formData = proxy({ series: {} as Record<number, Serie> });

export const AddPage = () => {
    // const [value, setValue] = useState("");
    const form = useForm({ defaultValues });
    const register = form.register;
    const onSubmit = (data, e) => {
        console.log(data, snapshot(formData), e);
    };
    const onError = (errors, e) => console.log(errors, e);

    const exoNameProps = register("exoName", { required: true });

    return (
        <form id="add-form" onSubmit={form.handleSubmit(onSubmit, onError)}>
            <FormProvider {...form}>
                <Stack p="8" overflow="auto">
                    <TextInput
                        label="Exercise name"
                        render={() => (
                            <Combobox
                                ref={exoNameProps.ref}
                                renderInput={(props) => (
                                    <Input
                                        {...props}
                                        name="exoName"
                                        onChange={callAll(props.onChange, exoNameProps.onChange)}
                                        onBlur={callAll(props.onBlur, exoNameProps.onBlur)}
                                        placeholder="Search..."
                                    />
                                )}
                                items={items}
                            />
                        )}
                        error={form.formState.errors.exoName}
                    />
                    {/* TODO prefill via exoName */}
                    <TextInput
                        {...register("nbSeries", { valueAsNumber: true })}
                        min={1}
                        max={10}
                        name="nbSeries"
                        label="Nb of series"
                        type="number"
                        error={form.formState.errors.nbSeries}
                    />
                    <div>
                        <Divider my="4" />
                    </div>
                    <WeightForm form={form} />
                    <div>
                        <Button
                            mt="8"
                            isFullWidth
                            leftIcon={<AddIcon />}
                            colorScheme="twitter"
                            variant="solid"
                            onClick={() => form.setValue("nbSeries", form.getValues().nbSeries + 1)}
                        >
                            Add serie
                        </Button>
                    </div>
                </Stack>
            </FormProvider>
        </form>
    );
};

const WeightForm = ({ form }: { form: UseFormReturn<typeof defaultValues> }) => {
    const [nbSeries] = form.watch(["nbSeries"]);

    return (
        <>
            <Heading as="h4" size="md">
                Weight
            </Heading>
            {makeArrayOf(nbSeries > 0 ? nbSeries : 1).map((_, seriesIndex) => {
                return <SeriesForm key={seriesIndex} index={seriesIndex} />;
            })}
        </>
    );
};

interface Serie {
    kg: number;
    reps: number;
}

const SeriesForm = ({ index }: { index: number }) => {
    // const form = useFormContext<typeof defaultValues>();
    const getSerie = () => formData.series[index] as Serie;

    // Set this.kg default value to previous serie.kg
    useEffect(() => {
        if (!formData.series[index]) {
            formData.series[index] = proxy({ kg: snapshot(formData.series)[index - 1]?.kg ?? 0, reps: 0 });
        }

        return () => {
            delete formData.series[index];
        };
    }, []);

    return (
        <Fragment key={index}>
            {index > 0 ? (
                <div>
                    <Divider my="2" />
                </div>
            ) : null}
            <Flex alignItems={"center"}>
                <Text>Serie {index + 1}</Text>
                {/* <Text ml="1" fontSize="xs" color="gray.400">
                    ({nbRepsBySeries})
                </Text> */}
            </Flex>
            <Stack direction="row">
                <TextInput
                    label="kg"
                    render={() => (
                        <MobileNumberInput
                            // Set default value on input from current proxy snapshot.kg
                            ref={(node) => {
                                if (!node) return;
                                if (node.value) return;

                                const snap = snapshot(formData.series);
                                if (snap[index - 1]) {
                                    node.value = snap[index - 1].kg;
                                }
                            }}
                            min={1}
                            max={20}
                            onChange={(_, value) => (getSerie().kg = value)}
                            inputProps={{ placeholder: "kg" }}
                            inputMode="numeric"
                        />
                    )}
                />
                <TextInput
                    type="number"
                    min={1}
                    max={20}
                    label="Nb of reps"
                    onChange={(e) => (getSerie().reps = e.target.valueAsNumber)}
                />
            </Stack>
        </Fragment>
    );
};

// <MobileNumberInput min={1} step={10} inputProps={{ placeholder: "kg" }} inputMode="numeric" {...props} />
{
    /* <TextInput
                    maxW="65px"
                    type="number"
                    min={1}
                    max={500}
                    label="kg"
                    onChange={(e) => (serie.kg = e.target.valueAsNumber)}
                /> */
}

interface Item {
    label: string;
    value: string;
}
const countries: Item[] = [
    { value: "ghana", label: "Ghana" },
    { value: "nigeria", label: "Nigeria" },
    { value: "kenya", label: "Kenya" },
    { value: "southAfrica", label: "South Africa" },
    { value: "unitedStates", label: "United States" },
    { value: "canada", label: "Canada" },
    { value: "germany", label: "Germany" },
];

const items = ["Seattle", "San Francisco", "Springfield", "New York", "Boston"];
