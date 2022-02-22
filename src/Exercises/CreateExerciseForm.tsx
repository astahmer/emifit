import { ConfirmationButton } from "@/components/ConfirmationButton";
import { MobileNumberInput } from "@/components/MobileNumberInput";
import { TextInput } from "@/components/TextInput";
import { onError } from "@/functions/toasts";
import { Exercise, makeId, Serie } from "@/store";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Button, Divider, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { update } from "idb-keyval";
import { Fragment, ReactNode, useEffect } from "react";
import {
    FormProvider,
    useFieldArray,
    UseFieldArrayReturn,
    useForm,
    useFormContext,
    UseFormReturn,
} from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { ExoNameAutocomplete } from "./ExoNameAutocomplete";
import { TagMultiSelect } from "./TagMultiSelect";

const defaultValues: Pick<Exercise, "name" | "nbSeries" | "tags" | "series"> = {
    name: "",
    nbSeries: 1,
    tags: [],
    series: [makeSerie(0)] as Serie[],
};

const makeExercise = (params: typeof defaultValues & { category: string }) =>
    ({
        ...params,
        id: makeId(),
        date: format(new Date(), "dd/MM/yyyy"),
        series: params.series.map((serie) => ({ ...serie, id: makeId() })),
    } as Exercise);
function makeSerie(index: number, current = []) {
    return { id: makeId(), kg: current[index - 1]?.kg ?? 1, reps: 1 };
}

const required = { value: true, message: "This field is required" };

export const CreateExerciseForm = ({
    renderSubmit,
    catId,
    onCreated,
}: {
    catId: string;
    onCreated?: (data: Exercise) => void;
    renderSubmit?: (form: UseFormReturn<typeof defaultValues>) => ReactNode;
}) => {
    const form = useForm({ defaultValues });

    const queryClient = useQueryClient();
    const mutation = useMutation(
        async (params: typeof defaultValues) => {
            const row = makeExercise({ ...params, category: catId });
            console.log(row);
            await update("exercises", (current) => [...(current || []), row]);
            return row;
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries("exercises");
                onCreated?.(data);
            },
            onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
        }
    );

    return (
        <Box as="form" id="add-form" onSubmit={form.handleSubmit((data) => mutation.mutate(data))} h="100%">
            <FormProvider {...form}>
                <Stack p="8" overflow="auto" h="100%">
                    <ExoNameAutocomplete {...form.register("name", { required })} />
                    <TagMultiSelect
                        control={form.control}
                        name="tags"
                        rules={{ required }}
                        catId={catId}
                        error={(form.formState.errors.tags as any)?.message}
                    />
                    {/* TODO prefill via name */}
                    <TextInput
                        {...form.register("nbSeries", { valueAsNumber: true })}
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
                            colorScheme="pink"
                            variant="solid"
                            onClick={() => form.setValue("nbSeries", form.getValues().nbSeries + 1)}
                            size="sm"
                        >
                            Add serie
                        </Button>
                    </div>
                    {renderSubmit?.(form)}
                </Stack>
            </FormProvider>
        </Box>
    );
};

const WeightForm = ({ form }: { form: UseFormReturn<typeof defaultValues> }) => {
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
                series.append(makeSerie(i, current));
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
    series: UseFieldArrayReturn<typeof defaultValues, "series">;
}) => {
    const form = useFormContext<typeof defaultValues>();
    const getSerie = () => series.fields[index];
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
                {/* <Text ml="1" fontSize="xs" color="gray.400">
                    ({nbRepsBySeries})
                </Text> */}
            </Flex>
            <Stack direction="row">
                <TextInput
                    label="kg"
                    render={() => (
                        <MobileNumberInput
                            {...form.register(`series.${index}.kg`, { valueAsNumber: true })}
                            defaultValue={serie.kg}
                            min={1}
                            max={20}
                            onChange={(_, value) => (getSerie().kg = value)}
                            inputProps={{ placeholder: "kg" }}
                            inputMode="numeric"
                            isRequired
                        />
                    )}
                />
                <TextInput
                    {...form.register(`series.${index}.reps`, { valueAsNumber: true })}
                    type="number"
                    defaultValue={serie.reps}
                    min={1}
                    max={20}
                    label="Nb of reps"
                    onChange={(e) => (getSerie().reps = e.target.valueAsNumber)}
                    isRequired
                />
            </Stack>
        </Fragment>
    );
};
