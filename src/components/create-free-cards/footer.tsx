import { Box, Container, Text } from "@chakra-ui/react";

const CreateFreeCardsFooter = () => {
  return (
    <Box
      style={{ backgroundColor: "rgb(211, 211, 211)" }}
      className="h-[60px] flex justify-center items-center">
      <Text className="text-center">
        Copyright © 2024 meWedding. All rights reserved
      </Text>
    </Box>
  );
};

export default CreateFreeCardsFooter;
