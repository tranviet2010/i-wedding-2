import {
  Box,
  Circle,
  Container,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
} from "@chakra-ui/react";

const CreateFreeCardsContactSection = () => {
  return (
    <Box
      style={{
        backgroundColor: "rgb(248, 248, 248)",
      }}>
      <Container
        style={{
          backgroundColor: "rgb(248, 248, 248)",
        }}>
        <Box
          className="grid gap-4 
            grid-cols-2 grid-rows-2 
            md:grid-cols-3 md:grid-rows-1">
          <Box className="col-span-2 md:col-span-1  p-4 text-center flex flex-col items-center">
            <Text
              style={{
                fontFamily: '"Dancing Script", cursive',
                fontWeight: "bold",
                lineHeight: 1.6,
                color: "rgb(251, 65, 65)",
                fontSize: "40px",
              }}
              className="cursor-pointer">
              meWedding
            </Text>
            <Text className="cursor-pointer">
              Giữ hạnh phúc - Kết nối yêu thương
            </Text>
            <Text className="cursor-pointer mt-3">
              CÔNG TY TNHH TM&DV TITUGROUP VIỆT NAM
            </Text>
            <Text className="cursor-pointer">Mã số thuế : 0109330197</Text>
            <Flex gap={4} className="mt-4">
              <Circle size="40px" bg="gray.200">
                <Image src="/facebook.svg" width={"30px"} height={"30px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/tiktok.svg" width={"30px"} height={"30px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/youtube.svg" width={"30px"} height={"30px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/zalo.svg" width={"30px"} height={"30px"} />
              </Circle>
            </Flex>
          </Box>

          <Box className="p-4">
            <Text
              fontWeight={"semibold"}
              fontSize={"md"}
              className="cursor-pointer">
              | Liên hệ
            </Text>
            <Text fontSize={"sm"} className="cursor-pointer">
              Bạn cần tư vấn vui lòng liên hệ với chúng tôi qua các kênh liên hệ
              phía dưới
            </Text>
            <Flex gap={4} className="mt-4">
              <Circle size="40px" bg="gray.200">
                <Image src="/facebook.svg" width={"30px"} height={"30px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/messenger.svg" width={"30px"} height={"30px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/zalo.svg" width={"30px"} height={"30px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/tiktok.svg" width={"30px"} height={"30px"} />
              </Circle>
            </Flex>
          </Box>
          <Box className="p-4 flex flex-col gap-3">
            <Text
              fontWeight={"semibold"}
              fontSize={"md"}
              className="cursor-pointer">
              | meWedding
            </Text>
            <Text
              fontSize={"sm"}
              className="cursor-pointer hover:scale-105 transition-transform duration-30">
              Trang chủ
            </Text>
            <Text
              fontSize={"sm"}
              className="cursor-pointer hover:scale-105 transition-transform duration-30">
              Điều khoản sử dụng
            </Text>
            <Text
              fontSize={"sm"}
              className="cursor-pointer hover:scale-105 transition-transform duration-30">
              Chính sách bảo mật
            </Text>
            <Text
              fontSize={"sm"}
              className="cursor-pointer hover:scale-105 transition-transform duration-30">
              Chăm sóc khách hàng
            </Text>
            <Text
              fontSize={"sm"}
              className="cursor-pointer hover:scale-105 transition-transform duration-30">
              Thanh toán
            </Text>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateFreeCardsContactSection;
