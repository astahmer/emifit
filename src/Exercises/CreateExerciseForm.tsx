import { ConfirmationButton } from "@/components/ConfirmationButton";
import { MobileNumberInput } from "@/components/MobileNumberInput";
import { SwitchInput } from "@/components/SwitchInput";
import { TextInput } from "@/components/TextInput";
import { onError } from "@/functions/toasts";
import { Exercise, Serie } from "@/orm-types";
import { makeExercise, makeSerie } from "@/orm-utils";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, BoxProps, Button, Divider, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { Fragment, ReactNode, useEffect } from "react";
import {
    FormProvider,
    useFieldArray,
    UseFieldArrayReturn,
    useForm,
    useFormContext,
    UseFormReturn,
} from "react-hook-form";
import { useMutation } from "react-query";
import { ExerciseCombobox } from "./ExerciseCombobox";
import { TagMultiSelect } from "./TagMultiSelect";

const formDefaultValues: Pick<Exercise, "name" | "tags" | "series"> & { nbSeries: number } = {
    name: "",
    nbSeries: 1,
    tags: [],
    series: [makeSerie(0)] as Serie[],
};
export type ExerciseFormValues = typeof formDefaultValues;

type CreateExerciseParams = Omit<typeof formDefaultValues, "nbSeries"> & { category: string };

const required = { value: true, message: "This field is required" };

export const CreateExerciseForm = ({
    id,
    renderSubmit,
    category,
    onSubmit,
    onChange,
    defaultValues = formDefaultValues,
    renderFormTop,
    shouldOverflow = true,
}: {
    id?: BoxProps["id"];
    category: string;
    onSubmit?: (data: Exercise) => void;
    onChange?: (values: typeof formDefaultValues) => void;
    renderSubmit?: (form: UseFormReturn<typeof formDefaultValues>) => ReactNode;
    defaultValues?: typeof formDefaultValues;
    renderFormTop?: () => ReactNode;
    shouldOverflow?: boolean;
}) => {
    const form = useForm({ defaultValues });

    const mutation = useMutation(async (params: CreateExerciseParams) => makeExercise({ ...params, category }), {
        onSuccess: onSubmit,
        onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
    });

    const onCreate = ({ nbSeries, ...params }: typeof formDefaultValues) =>
        mutation.mutate(makeExercise({ ...params, category }));

    useEffect(() => {
        if (!onChange) return;

        const sub = form.watch((values) => void onChange(values as typeof formDefaultValues));
        return () => sub.unsubscribe();
    }, [onChange, form.watch]);

    return (
        <FormProvider {...form}>
            <Box
                id={id}
                as="form"
                onSubmit={form.handleSubmit(onCreate)}
                h={shouldOverflow ? "100%" : undefined}
                minH={shouldOverflow ? 0 : undefined}
                d="flex"
                flexDirection="column"
            >
                <Stack p="8" pt="4" overflow={shouldOverflow ? "auto" : undefined} h="100%" minH={0}>
                    {renderFormTop?.()}
                    <ExerciseCombobox
                        {...form.register("name", { required })}
                        defaultValue={defaultValues.name}
                        initialSelectedItem={defaultValues.name ? (defaultValues as any as Exercise) : undefined}
                        onSelectedItemChange={(changes) => {
                            if (changes.selectedItem) {
                                form.reset({
                                    name: changes.selectedItem.name,
                                    series: changes.selectedItem.series,
                                    nbSeries: changes.selectedItem.series.length,
                                    tags: changes.selectedItem.tags,
                                });
                            } else {
                                form.reset({ name: null, series: [], nbSeries: 0, tags: [] });
                            }
                        }}
                        params={{ index: "by-category", query: category }}
                    />
                    <TagMultiSelect
                        control={form.control}
                        name="tags"
                        rules={{ required }}
                        catId={category}
                        error={(form.formState.errors.tags as any)?.message}
                    />
                    <TextInput
                        {...form.register("nbSeries", { valueAsNumber: true })}
                        min={1}
                        max={10}
                        label="Nb of series"
                        type="number"
                        inputMode="decimal"
                        error={form.formState.errors.nbSeries}
                        onWheel={() => {
                            if ((document.activeElement as HTMLInputElement).type === "number") {
                                (document.activeElement as HTMLInputElement).blur();
                            }
                        }}
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
                            colorScheme="pink"
                            variant="outline"
                            onClick={() => form.setValue("nbSeries", form.getValues().nbSeries + 1)}
                            size="sm"
                        >
                            Add serie
                        </Button>
                    </div>
                </Stack>
                <Box mb="2" flexShrink={0}>
                    {renderSubmit?.(form)}
                </Box>
            </Box>
        </FormProvider>
    );
};

const WeightForm = ({ form }: { form: UseFormReturn<typeof formDefaultValues> }) => {
    const [nbSeries] = form.watch(["nbSeries"]);
    const series = useFieldArray({ control: form.control, name: "series" });

    // Adjust (add/remove items) field array from nbSeries
    useEffect(() => {
        const current = [...series.fields];
        if (current.length === nbSeries) {
            return;
        }

        if (nbSeries < current.length) {
            series.replace(series.fields.slice(0, nbSeries));
            return;
        }

        for (let i = 0; i < nbSeries; i++) {
            if (i >= current.length) {
                series.append(makeSerie(i, current), { shouldFocus: false });
            }
        }
    }, [nbSeries, series.fields]);

    return (
        <>
            <Heading as="h4" size="md">
                Weight
            </Heading>
            {series.fields.map((item, seriesIndex) => {
                return <SeriesForm key={item.id} index={seriesIndex} serie={item} series={series} />;
            })}
        </>
    );
};

const SeriesForm = ({
    index,
    serie,
    series,
}: {
    index: number;
    serie: Serie;
    series: UseFieldArrayReturn<typeof formDefaultValues, "series">;
}) => {
    const getSerie = () => series.fields[index];
    const form = useFormContext<typeof formDefaultValues>();
    const deleteSerie = () => {
        form.setValue("nbSeries", form.getValues().nbSeries - 1);
        series.remove(index);
    };

    return (
        <Fragment>
            {index > 0 ? (
                <div>
                    <Divider my="2" />
                </div>
            ) : null}
            <Flex alignItems={"center"}>
                <Text>Serie {index + 1}</Text>
                <ConfirmationButton
                    onConfirm={deleteSerie}
                    renderTrigger={(onOpen) => (
                        <IconButton
                            ml="auto"
                            size="xs"
                            aria-label={"delete serie"}
                            colorScheme="messenger"
                            border="1px solid"
                            borderColor="gray.300"
                            icon={<DeleteIcon />}
                            onClick={onOpen}
                        />
                    )}
                />
            </Flex>
            {index === 0 ? (
                <SwitchInput
                    id={`serie-${index}-is-warmup`}
                    label="Warmup set ?"
                    onChange={(e) => void form.setValue(`series.${index}.kind`, e.target.checked ? "warmup" : null)}
                    defaultChecked={serie.kind === "warmup"}
                />
            ) : null}
            <Stack direction="row">
                <TextInput
                    {...form.register(`series.${index}.kg`, { valueAsNumber: true })}
                    type="number"
                    inputMode="decimal"
                    defaultValue={serie.kg}
                    min={1}
                    max={400}
                    label="Nb of kg"
                    onChange={(e) => {
                        series.update(index, { ...getSerie(), kg: e.target.valueAsNumber });
                    }}
                    isRequired
                />
                <TextInput
                    label="Nb of reps"
                    render={() => (
                        <MobileNumberInput
                            {...form.register(`series.${index}.reps`, { valueAsNumber: true })}
                            type="number"
                            inputMode="decimal"
                            defaultValue={serie.reps}
                            min={1}
                            max={20}
                            onChange={(_, value) => {
                                series.update(index, { ...getSerie(), reps: value });
                            }}
                            isRequired
                            inputProps={{ placeholder: "reps" }}
                        />
                    )}
                />
            </Stack>
        </Fragment>
    );
};
