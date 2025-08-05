import {
  Box,
  Circle,
  Container,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import Zalo from "../../assets/icons/zalo";

const CreateFreeCardsContactSection = () => {
  return (
    <Box
      style={{
        backgroundColor: "rgb(248, 248, 248)",
      }}
    >
      <Container
        style={{
          backgroundColor: "rgb(248, 248, 248)",
        }}
      >
        <Box
          className="grid gap-4 
            grid-cols-2 grid-rows-2 
            md:grid-cols-3 md:grid-rows-1"
        >
          <Box className="col-span-2 md:col-span-1  p-4 text-center flex flex-col items-center">
            <Text
              style={{
                fontFamily: '"Dancing Script", cursive',
                fontWeight: "bold",
                lineHeight: 1.6,
                color: "rgb(251, 65, 65)",
                fontSize: "40px",
              }}
              className="cursor-pointer"
            >
              meWedding
            </Text>
            <Text
              className="cursor-pointer"
              fontFamily={'"Quicksand", sans-serif'}
            >
              Giữ hạnh phúc - Kết nối yêu thương
            </Text>
            <Text
              className="cursor-pointer mt-3"
              fontFamily={'"Quicksand", sans-serif'}
            >
              CÔNG TY TNHH MEHAPPY
            </Text>
            <Text
              className="cursor-pointer"
              fontFamily={'"Quicksand", sans-serif'}
            >
              Mã số thuế : 0111152872
            </Text>
            <Flex gap={4} className="mt-4">
              <Circle size="40px" bg="gray.200">
                <Image src="/facebook.svg" width={"25px"} height={"25px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/tiktok.svg" width={"20px"} height={"20px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Image src="/youtube.svg" width={"25px"} height={"25px"} />
              </Circle>
              <Circle size="40px" bg="gray.200">
                <Zalo />
              </Circle>
            </Flex>
          </Box>

          <Box className="p-4">
            <Text
              fontWeight={"semibold"}
              fontSize={"md"}
              fontFamily={'"Quicksand", sans-serif'}
              className="cursor-pointer"
            >
              | Liên hệ
            </Text>
            <Text
              fontSize={["13px", "13px", "14px"]}
              maxWidth="270px"
              className="cursor-pointer"
              fontFamily='"Quicksand", sans-serif'
            >
              Bạn cần tư vấn vui lòng liên hệ với chúng tôi qua các kênh liên hệ
              phía dưới
            </Text>
            <Wrap className="mt-4">
              <WrapItem>
                <Circle
                  size="32px"
                  bg="gray.200"
                  onClick={() =>
                    window.open("https://fb.com/meweddingg", "_blank")
                  }
                >
                  <Image src="/facebook.svg" width="18px" height="18px" />
                </Circle>
              </WrapItem>
              <WrapItem>
                <Circle
                  size="32px"
                  bg="gray.200"
                  onClick={() =>
                    window.open("https://m.me/meweddingg", "_blank")
                  }
                >
                  <Image src="/messenger.svg" width="20px" height="20px" />
                </Circle>
              </WrapItem>
              <WrapItem>
                <Circle
                  size="32px"
                  bg="gray.200"
                  onClick={() =>
                    window.open("https://zalo.me/0818090333", "_blank")
                  }
                >
                  <Zalo width={18} height={18} />
                </Circle>
              </WrapItem>
              <WrapItem>
                <Circle size="32px" bg="gray.200">
                  <Image src="/tiktok.svg" width="16px" height="16px" />
                </Circle>
              </WrapItem>
            </Wrap>
          </Box>
          <Box className="p-4 flex flex-col gap-3">
            <Text
              fontWeight={"semibold"}
              fontSize={"md"}
              fontFamily={'"Quicksand", sans-serif'}
              className="cursor-pointer"
            >
              | meHappy
            </Text>
            <Text
              fontSize={["13px", "13px", "14px"]}
              fontFamily={'"Quicksand", sans-serif'}
              className="cursor-pointer hover:scale-105 transition-transform duration-30"
            >
              Trang chủ
            </Text>
            <Text
              fontSize={["13px", "13px", "14px"]}
              fontFamily={'"Quicksand", sans-serif'}
              className="cursor-pointer hover:scale-105 transition-transform duration-30"
            >
              Điều khoản sử dụng
            </Text>
            <Text
              fontSize={["13px", "13px", "14px"]}
              fontFamily={'"Quicksand", sans-serif'}
              className="cursor-pointer hover:scale-105 transition-transform duration-30"
            >
              Chính sách bảo mật
            </Text>
            <Text
              fontSize={["13px", "13px", "14px"]}
              fontFamily={'"Quicksand", sans-serif'}
              className="cursor-pointer hover:scale-105 transition-transform duration-30"
            >
              Chăm sóc khách hàng
            </Text>
            <Text
              fontSize={["13px", "13px", "14px"]}
              fontFamily={'"Quicksand", sans-serif'}
              className="cursor-pointer hover:scale-105 transition-transform duration-30"
            >
              Thanh toán
            </Text>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateFreeCardsContactSection;
