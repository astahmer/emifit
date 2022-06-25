import {
    Box,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalOverlay,
    useDisclosure,
    UseDisclosureReturn,
} from "@chakra-ui/react";
import { ReactNode } from "react";

export const FloatingButton = ({
    renderButton,
    renderModalContent,
}: {
    renderButton: (props: UseDisclosureReturn) => ReactNode;
    renderModalContent: (props: UseDisclosureReturn) => ReactNode;
}) => {
    const toggle = useDisclosure();
    const { isOpen, onClose } = toggle;

    return (
        <Box pos="absolute" bottom={5} right={5}>
            {renderButton(toggle)}
            <Modal onClose={onClose} isOpen={isOpen} motionPreset="slideInBottom">
                <ModalOverlay />
                <ModalContent position="fixed" bottom="0" mb="0" roundedTop="3xl">
                    <ModalCloseButton />
                    <ModalBody mt="4">{renderModalContent(toggle)}</ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};
