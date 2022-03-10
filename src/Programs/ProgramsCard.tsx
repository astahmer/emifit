import { ConfirmationButton } from "@/components/ConfirmationButton";
import { onError, successToast } from "@/functions/toasts";
import { orm } from "@/orm";
import { Program } from "@/orm-types";
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, DragHandleIcon, EditIcon } from "@chakra-ui/icons";
import {
    Badge,
    Box,
    chakra,
    Collapse,
    forwardRef,
    Icon,
    IconButton,
    IconButtonProps,
    ListItem,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    UnorderedList,
    useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useMutation, useQueryClient } from "react-query";

export type ProgramCardProps = { program: Program; onEdit: (program: Program) => void };
export const ProgramCard = ({ program, onEdit }: ProgramCardProps) => {
    const { isOpen, onToggle } = useDisclosure();

    const queryClient = useQueryClient();
    const mutation = useMutation(async (program: Program) => orm.program.remove(program), {
        onSuccess: () => {
            queryClient.invalidateQueries("programList");
            successToast(`Program <${program.name}> deleted`);
        },
        onError: (err) => void onError(typeof err === "string" ? err : (err as any).message),
    });

    return (
        <Box d="flex" flexDirection="column" w="100%" bgColor="white">
            <Box d="flex" alignItems="center">
                <Box alignSelf="center" h="30px" w="1px" opacity={0.8} bgColor="pink.100" />
                <Box d="flex" alignItems="center" w="100%" onClick={onToggle}>
                    <Box d="flex" flexDirection="column" justifyContent="space-around" p="4">
                        {isOpen ? <ChevronUpIcon fontSize="20px" /> : <ChevronDownIcon fontSize="20px" />}
                    </Box>
                    <Box d="flex" flexDirection="column" alignItems="flex-start">
                        <chakra.span color="pink.300" fontWeight="bold">
                            {program.name}
                        </chakra.span>
                        <Badge variant="subtle" colorScheme="pink" fontSize="x-small">
                            {program.category}
                        </Badge>
                    </Box>
                </Box>
                <Menu strategy="absolute">
                    <MenuButton as={DotsIconButton} />
                    <MenuList>
                        <MenuItem icon={<EditIcon />} onClick={() => onEdit(program)}>
                            Edit program
                        </MenuItem>
                        <ConfirmationButton
                            renderTrigger={(onOpen) => (
                                <MenuItem icon={<DeleteIcon />} onClick={onOpen}>
                                    Delete program
                                </MenuItem>
                            )}
                            onConfirm={() => mutation.mutate(program)}
                        />
                    </MenuList>
                </Menu>
                <Box d="flex" flexDirection="column" justifyContent="space-around" p="4" ml="auto">
                    <Icon as={DragHandleIcon} size="24px" />
                </Box>
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
        </Box>
    );
};

const DotsIconButton = forwardRef((props: IconButtonProps, ref) => (
    <IconButton
        ref={ref}
        aria-label="validate"
        {...props}
        icon={<BsThreeDotsVertical />}
        variant="solid"
        size="sm"
        colorScheme="pink"
        opacity={0.6}
    />
));
