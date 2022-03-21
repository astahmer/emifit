import { ConfirmationButton } from "@/components/ConfirmationButton";
import { DotsIconButton } from "@/components/DotsIconButton";
import { HFlex } from "@/components/HFlex";
import { onError, successToast } from "@/functions/toasts";
import { makeId } from "@/functions/utils";
import { orm } from "@/orm";
import { Program } from "@/orm-types";
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, DragHandleIcon, EditIcon } from "@chakra-ui/icons";
import {
    Badge,
    Box,
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
import { ReactNode } from "react";
import { HiOutlineDuplicate } from "react-icons/hi";
import { useMutation, useQueryClient } from "react-query";

export type ProgramCardProps = { program: Program; headerRight?: () => ReactNode; defaultIsOpen?: boolean };
export const ProgramCard = ({ program, headerRight, defaultIsOpen }: ProgramCardProps) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen });

    return (
        <HFlex w="100%" bgColor="white">
            <Box d="flex" alignItems="center">
                <Box alignSelf="center" h="30px" w="1px" opacity={0.8} bgColor="pink.100" />
                <Box d="flex" alignItems="center" w="100%" onClick={onToggle}>
                    <HFlex justifyContent="space-around" p="4">
                        {isOpen ? <ChevronUpIcon fontSize="20px" /> : <ChevronDownIcon fontSize="20px" />}
                    </HFlex>
                    <HFlex alignItems="flex-start">
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
                    <UnorderedList color="grey" listStyleType="none">
                        {program.exerciseList.map((exo) => (
                            <ListItem key={exo.id}>
                                - {exo.name} ({exo.series.length} set)
                            </ListItem>
                        ))}
                    </UnorderedList>
                </Stack>
            </Collapse>
        </HFlex>
    );
};

export type EditableProgramCardProps = ProgramCardProps & Pick<EditableProgramCardHeaderProps, "onEdit">;
export const EditableProgramCard = ({ headerRight, ...props }: EditableProgramCardProps) => (
    <ProgramCard {...props} headerRight={() => <EditableProgramCardHeader {...props} />} />
);

type EditableProgramCardHeaderProps = Pick<ProgramCardProps, "program"> & { onEdit: (program: Program) => void };
const EditableProgramCardHeader = ({ program, onEdit }: EditableProgramCardHeaderProps) => {
    const queryClient = useQueryClient();
    const deleteMutation = useMutation(async (program: Program) => orm.program.remove(program), {
        onSuccess: () => {
            queryClient.invalidateQueries(orm.program.key);
            successToast(`Program <${program.name}> deleted`);
        },
        onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
    });

    const cloneMutation = useMutation(
        async (program: Program) => orm.program.create({ ...program, id: makeId(), name: program.name + " (clone)" }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(orm.program.key);
                successToast(`Program <${program.name}> cloned`);
            },
            onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
        }
    );

    return (
        <>
            <Menu strategy="absolute">
                <MenuButton as={DotsIconButton} />
                <MenuList>
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
