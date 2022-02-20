import { Button, ButtonGroup, useDisclosure } from "@chakra-ui/react";
import { ReactNode } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
} from "@chakra-ui/react";

export function ConfirmationButton({
    renderTrigger,
    onConfirm,
}: {
    renderTrigger: (onOpen: () => void) => ReactNode;
    onConfirm: () => void;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Popover isOpen={isOpen} onClose={onClose}>
            <PopoverTrigger>{renderTrigger(onOpen)}</PopoverTrigger>
            <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
                <PopoverHeader fontWeight="semibold" border="0">
                    Confirmation
                </PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>Are you sure ?</PopoverBody>
                <PopoverFooter d="flex" justifyContent="flex-end" border="0">
                    <ButtonGroup size="sm">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={() => (onConfirm(), onClose())}>
                            Apply
                        </Button>
                    </ButtonGroup>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    );
}
