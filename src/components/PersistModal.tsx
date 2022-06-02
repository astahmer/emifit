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
    onConfirm,
    renderBody,
    formId,
}: {
    renderTrigger: (onOpen: () => void) => ReactNode;
    renderBody: (onClose: () => void) => ReactNode;
    title: string;
    onConfirm?: (onClose: () => void) => void;
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
                        <Button
                            colorScheme="pink"
                            variant="solid"
                            onClick={() => onConfirm?.(onClose)}
                            form={formId}
                            type={formId ? "submit" : undefined}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
