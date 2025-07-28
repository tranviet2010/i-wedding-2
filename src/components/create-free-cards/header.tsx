import {
  Box,
  Button,
  Container,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuMenu } from "react-icons/lu";

const CreateFreeCardsHeader = () => {
  const handleScrollToQuestion = () => {
    const e = document.getElementById("question-id");
    if (e) {
      e.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleScrollToCard = () => {
    const e = document.getElementById("card-id");
    if (e) {
      e.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box className="fixed left-0 right-0 top-0 z-99999 bg-white">
      <Container maxW={"6xl"} className="h-[51px]">
        <Box className="flex justify-between items-center h-full">
          <Box className="flex items-center gap-1">
            <img src="/logo.png" className="w-[39.84px] h-[39.84px]" />
            <p
              style={{
                fontFamily: '"Dancing Script", cursive',
                fontWeight: "bold",
                lineHeight: 1.6,
                color: "rgb(251, 65, 65)",
                fontSize: "25px",
              }}
              className="">
              meWedding
            </p>
          </Box>
          <Box className="flex justify-between items-center gap-4">
            <Text
              onClick={handleScrollToCard}
              fontWeight="semibold"
              className="hidden md:inline cursor-pointer hover:text-red-600">
              Mẫu Thiệp
            </Text>
            <Text
              onClick={handleScrollToQuestion}
              fontWeight="semibold"
              className="hidden md:inline cursor-pointer hover:text-red-600">
              Liên hệ
            </Text>
            <Button
              bg="red.500"
              color="white"
              borderRadius="2xl"
              height={8}
              _hover={{ bg: "red.600" }}>
              Đăng nhập
            </Button>
            <Popover.Root>
              <Popover.Trigger asChild>
                <LuMenu className="md:hidden cursor-pointer" size={40} />
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content width="auto">
                    <Popover.Body>
                      <Popover.Title
                        onClick={handleScrollToCard}
                        fontWeight="medium"
                        className="cursor-pointer hover:text-red-600">
                        Mẫu Thiệp
                      </Popover.Title>
                      <Popover.Title
                        onClick={handleScrollToQuestion}
                        fontWeight="medium"
                        className="cursor-pointer mt-2 hover:text-red-600">
                        Liên hệ
                      </Popover.Title>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateFreeCardsHeader;
