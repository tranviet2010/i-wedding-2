import { Box, Stack, Circle, Icon, Image } from "@chakra-ui/react";
import { FiHelpCircle, FiMessageSquare } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";

export default function FloatingWidget() {
  return (
    <Box
      className="border border-blue-400 fixed bottom-[20%] right-[3%]"
      rounded="xl"
      p={2}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={4}
      bg="white"
      w="fit-content">
      <Image src="/icon-question.png" width={"50px"} height={"50px"} />

      <Circle size="40px" bg="gray.200">
        <Image src="/messenger.svg" width={"30px"} height={"30px"} />
      </Circle>
    </Box>
  );
}
