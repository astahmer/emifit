import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    ButtonProps,
    useDisclosure,
} from "@chakra-ui/react";
import { ReactNode, useRef } from "react";

export function ConfirmationButton({
    renderTrigger,
    onConfirm,
    label = "Confirm",
    colorScheme = "red",
}: {
    renderTrigger: (onOpen: () => void) => ReactNode;
    onConfirm: () => void;
    label?: ReactNode;
    colorScheme?: ButtonProps["colorScheme"];
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();

    return (
        <>
            {renderTrigger(onOpen)}
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent mx="2">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Confirmation
                        </AlertDialogHeader>

                        <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme={colorScheme} onClick={() => (onConfirm(), onClose())} ml={3}>
                                {label}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}
