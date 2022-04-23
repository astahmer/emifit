import { Box, Divider, Flex, Skeleton, SkeletonCircle, Stack } from "@chakra-ui/react";

export const ExerciseListSkeleton = () => (
    <Stack mt="4">
        <ExerciseItemSkeleton />
        <Box px="8">
            <Divider my="2" />
        </Box>
        <ExerciseItemSkeleton />
        <Box px="8">
            <Divider my="2" />
        </Box>
        <ExerciseItemSkeleton />
    </Stack>
);
const ExerciseItemSkeleton = () => {
    return (
        <Box>
            <Flex flexDirection="column" px="8">
                <Skeleton w="225px" h="22px" />
                <Skeleton mt="2" w="145px" h="18px" />
                <Stack direction="row" mt="2">
                    <Skeleton w="65px" h="13.5px" />
                    <Skeleton w="85px" h="13.5px" />
                </Stack>
                <Stack mt="2">
                    <Stack direction="row">
                        <SkeletonCircle w="20px" h="20px" />
                        <Skeleton w="90px" h="20px" />
                    </Stack>
                    <Stack direction="row">
                        <SkeletonCircle w="20px" h="20px" />
                        <Skeleton w="90px" h="20px" />
                    </Stack>
                </Stack>
            </Flex>
        </Box>
    );
};
