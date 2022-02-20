import { Combobox } from "@/components/Combobox";
import { MobileNumberInput } from "@/components/MobileNumberInput";
import { SelectInput } from "@/components/SelectInput";
import { TextInput } from "@/components/TextInput";
import { Categories } from "@/constants";
import { onError } from "@/functions/toasts";
import { Exercise, makeId, Serie, useExercises } from "@/store";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Divider, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { makeArrayOf } from "@pastable/core";
import { format } from "date-fns";
import { update } from "idb-keyval";
import { Fragment, useEffect } from "react";
import { FormProvider, useForm, useFormContext, UseFormReturn } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { proxy, snapshot, subscribe } from "valtio";

const defaultValues = { exoName: "", nbSeries: 1, areKgFilled: false, areRepsFilled: false };
const formData = proxy({ series: {} as Record<number, Serie> });

type MakeExerciseParams = Pick<Exercise, "tag" | "category" | "name" | "nbSeries">;

const makeExercise = (params: MakeExerciseParams) => ({
    ...params,
    id: makeId(),
    date: format(new Date(), "dd/MM/yyyy"),
    series: Object.values(snapshot(formData.series)).map((serie) => serie),
});

export const AddPage = () => {
    const form = useForm({ defaultValues });
    const register = form.register;

    // reactivly set/clear errors from values of series[kg/reps]
    useEffect(() => {
        form.setError("areKgFilled", { type: "required" });
        form.setError("areRepsFilled", { type: "required" });

        return subscribe(formData, (ops) => {
            const series = Object.values(snapshot(formData.series));
            if (series.every((serie) => serie.kg)) {
                form.clearErrors("areKgFilled");
            } else if (form.formState.submitCount) {
                form.setError("areKgFilled", { type: "required" });
            }
            if (series.every((serie) => serie.reps)) {
                form.clearErrors("areRepsFilled");
            } else if (form.formState.submitCount) {
                form.setError("areRepsFilled", { type: "required" });
            }
        });
    }, []);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const mutation = useMutation(
        async (params: typeof defaultValues) => {
            const row = makeExercise({
                tag: "tag",
                category: catId,
                name: params.exoName,
                nbSeries: params.nbSeries,
            });
            await update("exercises", (current) => [...(current || []), row]);
            return row;
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries("exercises");
                navigate("/");
            },
            onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
        }
    );

    const [params] = useSearchParams();
    const catId = params.get("category") || Categories[0].id;
    const category = Categories.find((cat) => cat.id === (catId as typeof Categories[number]["id"]));
    const options = category.children.map((cat) => ({ label: cat.label, value: cat.id }));

    return (
        <form id="add-form" onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
            <FormProvider {...form}>
                <Stack p="8" overflow="auto">
                    <ExoNameAutocomplete />
                    <SelectInput label="Tag">
                        <option value="">Select a tag</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectInput>
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

const ExoNameAutocomplete = () => {
    const form = useFormContext<typeof defaultValues>();
    const query = useExercises();
    const items = query.data || [];

    return (
        <TextInput
            label="Exercise name"
            render={() => (
                <Combobox
                    itemToString={(item) => item.name}
                    {...form.register("exoName", { required: true })}
                    items={items}
                />
            )}
            error={form.formState.errors.exoName}
        />
    );
};

const WeightForm = ({ form }: { form: UseFormReturn<typeof defaultValues> }) => {
    const [nbSeries] = form.watch(["nbSeries"]);

    return (
        <>
            <Heading as="h4" size="md">
                Weight
            </Heading>
            {form.formState.submitCount && form.formState.errors.areKgFilled ? (
                <Text color="red.500">Fill all the "kg" inputs</Text>
            ) : null}
            {form.formState.submitCount && form.formState.errors.areRepsFilled ? (
                <Text color="red.500">Fill all the "reps" inputs</Text>
            ) : null}
            {makeArrayOf(nbSeries > 0 ? nbSeries : 1).map((_, seriesIndex) => {
                return <SeriesForm key={seriesIndex} index={seriesIndex} />;
            })}
        </>
    );
};

const SeriesForm = ({ index }: { index: number }) => {
    // const form = useFormContext<typeof defaultValues>();
    const getSerie = () => formData.series[index] as Serie;

    // Set this.kg default value to previous serie.kg
    useEffect(() => {
        if (!formData.series[index]) {
            formData.series[index] = proxy({
                id: makeId(),
                kg: snapshot(formData.series)[index - 1]?.kg ?? 0,
                reps: 0,
            });
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
                            // required
                        />
                    )}
                />
                <TextInput
                    type="number"
                    min={1}
                    max={20}
                    label="Nb of reps"
                    onChange={(e) => (getSerie().reps = e.target.valueAsNumber)}
                    // isRequired
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
