import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import { ReactNode, useRef } from "react";

export function PersistModal({
    renderTrigger,
    title,
    renderBody,
    renderConfirmButton,
    formId,
}: {
    renderTrigger: (onOpen: () => void) => ReactNode;
    renderBody: (onClose: () => void) => ReactNode;
    renderConfirmButton?: (onClose: () => void) => ReactNode;
    title: string;
    formId?: string;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialFocusRef = useRef();

    return (
        <>
            {renderTrigger(onOpen)}
            <Modal
                isCentered
                onClose={onClose}
                isOpen={isOpen}
                motionPreset="slideInBottom"
                size="xs"
                initialFocusRef={initialFocusRef}
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>{renderBody(onClose)}</ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={onClose} variant="outline" ref={initialFocusRef}>
                            Cancel
                        </Button>
                        {renderConfirmButton?.(onClose) || (
                            <Button
                                colorScheme="pink"
                                variant="solid"
                                form={formId}
                                type={formId ? "submit" : undefined}
                            >
                                Save
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
