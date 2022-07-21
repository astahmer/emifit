import { ConfirmationButton } from "@/fields/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { HFlex } from "@/components/HFlex";
import { serializeExercise, serializeProgram } from "@/functions/snapshot";
import { onError, successToast } from "@/functions/toasts";
import { makeId } from "@/functions/utils";
import { orm } from "@/orm";
import { useCurrentDaily } from "@/orm-hooks";
import { Program } from "@/orm-types";
import { isDailyTodayAtom } from "@/store";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon, DragHandleIcon, EditIcon } from "@chakra-ui/icons";
import {
    Badge,
    Box,
    Button,
    chakra,
    Collapse,
    Icon,
    ListItem,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    UnorderedList,
    useDisclosure,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { ReactNode } from "react";
import { HiOutlineDuplicate } from "react-icons/hi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProgramForDailyMutation } from "./useProgramForDailyMutation";

export type ProgramCardProps = { program: Program; headerRight?: () => ReactNode; defaultIsOpen?: boolean };
export const ProgramCard = ({ program, headerRight, defaultIsOpen }: ProgramCardProps) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen });
    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const daily = useCurrentDaily();
    const programMutation = useProgramForDailyMutation();

    return (
        <HFlex w="100%" bgColor="white">
            <Box d="flex" alignItems="center">
                <Box alignSelf="center" h="30px" w="1px" opacity={0.8} bgColor="pink.100" />
                <Box d="flex" alignItems="center" w="100%" onClick={onToggle}>
                    <HFlex justifyContent="space-around" p="4">
                        {isOpen ? <ChevronUpIcon fontSize="20px" /> : <ChevronDownIcon fontSize="20px" />}
                    </HFlex>
                    <HFlex alignItems="flex-start" py="4">
                        <chakra.span color="pink.300" fontWeight="bold">
                            {program.name}
                        </chakra.span>
                        <Badge variant="subtle" colorScheme="pink" fontSize="x-small">
                            {program.category}
                        </Badge>
                    </HFlex>
                </Box>
                {headerRight?.()}
            </Box>
            <Collapse in={isOpen} animateOpacity>
                <Stack p="4" pl="2" w="100%" pos="relative">
                    <ProgramCardExerciseList program={program} />
                    {isDailyToday && program.category === daily.category && (
                        <ConfirmationButton
                            onConfirm={() => programMutation.mutate(program)}
                            colorScheme="whatsapp"
                            renderTrigger={(onOpen) => (
                                <Button leftIcon={<CheckIcon />} onClick={onOpen} variant="outline" colorScheme="pink">
                                    Use program
                                </Button>
                            )}
                        />
                    )}
                </Stack>
            </Collapse>
        </HFlex>
    );
};

export const ProgramCardExerciseList = ({ program }: { program: Program }) => (
    <UnorderedList color="grey" listStyleType="none">
        {program.exerciseList.map((exo) => (
            <ListItem key={exo.id}>
                - {exo.name} ({exo.series.length} set)
            </ListItem>
        ))}
    </UnorderedList>
);

export type EditableProgramCardProps = ProgramCardProps & Pick<EditableProgramCardHeaderProps, "onEdit">;
export const EditableProgramCard = ({ headerRight, ...props }: EditableProgramCardProps) => (
    <ProgramCard {...props} headerRight={() => <EditableProgramCardHeader {...props} />} />
);

type EditableProgramCardHeaderProps = Pick<ProgramCardProps, "program"> & { onEdit: (program: Program) => void };
const EditableProgramCardHeader = ({ program, onEdit }: EditableProgramCardHeaderProps) => {
    const queryClient = useQueryClient();
    const deleteMutation = useMutation(async (program: Program) => orm.program.delete(program.id), {
        onSuccess: () => {
            queryClient.invalidateQueries([orm.program.name]);
            successToast(`Program <${program.name}> deleted`);
        },
        onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
    });

    const cloneMutation = useMutation(
        async (program: Program) => {
            const tx = orm.exercise.tx("readwrite");
            const programId = makeId();
            const newExos = program.exerciseList.map((exo) => ({
                ...exo,
                id: makeId(),
                madeFromExerciseId: exo.id,
                programId: programId,
            }));
            const insertMany = newExos.map((exo) => tx.store.add(serializeExercise(exo)));

            const now = new Date();
            return Promise.all([
                ...insertMany,
                orm.program.add({
                    ...serializeProgram({
                        ...program,
                        id: programId,
                        name: program.name + " (clone)",
                        exerciseList: newExos,
                        madeFromProgramId: program.id,
                    }),
                    createdAt: now,
                    updatedAt: now,
                }),
                tx.done,
            ]);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries([orm.program.name]);
                successToast(`Program <${program.name}> cloned`);
            },
            onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
        }
    );

    const isDailyToday = useAtomValue(isDailyTodayAtom);
    const daily = useCurrentDaily();
    const programMutation = useProgramForDailyMutation();

    return (
        <>
            <Menu strategy="absolute">
                <MenuButton as={DotsIconButton} />
                <MenuList>
                    {isDailyToday && program.category === daily.category && (
                        <ConfirmationButton
                            onConfirm={() => programMutation.mutate(program)}
                            colorScheme="whatsapp"
                            renderTrigger={(onOpen) => (
                                <MenuItem icon={<CheckIcon />} onClick={onOpen}>
                                    Use program
                                </MenuItem>
                            )}
                        />
                    )}
                    <MenuItem icon={<EditIcon />} onClick={() => onEdit(program)}>
                        Edit program
                    </MenuItem>
                    <MenuItem
                        icon={<Icon as={HiOutlineDuplicate} fontSize="md" d="flex" />}
                        onClick={() => cloneMutation.mutate(program)}
                    >
                        Clone program
                    </MenuItem>
                    <ConfirmationButton
                        renderTrigger={(onOpen) => (
                            <MenuItem icon={<DeleteIcon />} onClick={onOpen}>
                                Delete program
                            </MenuItem>
                        )}
                        onConfirm={() => deleteMutation.mutate(program)}
                    />
                </MenuList>
            </Menu>
            <HFlex justifyContent="space-around" p="4" ml="auto">
                <Icon as={DragHandleIcon} size="24px" />
            </HFlex>
        </>
    );
};
