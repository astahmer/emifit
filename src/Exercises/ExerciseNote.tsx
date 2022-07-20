import { Exercise } from "@/orm-types";
import { Box, Text } from "@chakra-ui/react";

export const ExerciseNote = ({ exo }: { exo: Exercise }) =>
    Boolean(exo.note) ? (
        <Box mt="2" fontWeight="normal" fontSize="xs" color="gray.500">
            <Text as="span" fontWeight="bold">
                Note:
            </Text>
            <Text ml="1" as="span">
                {exo.note}
            </Text>
        </Box>
    ) : null;
