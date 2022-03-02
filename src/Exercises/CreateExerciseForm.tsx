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
import { ExerciseCombobox } from "./ExerciseCombobox";
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
        date: format(new Date(), "MM/dd/yyyy"),
        datetime: new Date(),
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
    shouldPersist = true,
}: {
    catId: string;
    onCreated?: (data: Exercise) => void;
    renderSubmit?: (form: UseFormReturn<typeof defaultValues>) => ReactNode;
    shouldPersist?: boolean;
}) => {
    const form = useForm({ defaultValues });

    const queryClient = useQueryClient();
    const mutation = useMutation(
        async (params: typeof defaultValues) => {
            const row = makeExercise({ ...params, category: catId });
            console.log(row);
            if (shouldPersist) {
                await update("exerciseList", (current) => [...(current || []), row]);
            }

            return row;
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries("exerciseList");
                onCreated?.(data);
            },
            onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
        }
    );

    const onCreate = (params: typeof defaultValues) => mutation.mutate(makeExercise({ ...params, category: catId }));

    return (
        <FormProvider {...form}>
            <Box
                as="form"
                id="add-form"
                onSubmit={form.handleSubmit(onCreate)}
                h="100%"
                minH={0}
                d="flex"
                flexDirection="column"
            >
                <Box h="100%" minH={0}>
                    <Stack p="8" pt="4" overflow="auto" h="100%" minH={0}>
                        <ExerciseCombobox {...form.register("name", { required })} />
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
                                variant="outline"
                                onClick={() => form.setValue("nbSeries", form.getValues().nbSeries + 1)}
                                size="sm"
                            >
                                Add serie
                            </Button>
                        </div>
                    </Stack>
                </Box>
                <Box mb="2">{renderSubmit?.(form)}</Box>
            </Box>
        </FormProvider>
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
