import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";

const CreateFreeCardsBannerSection = () => {
  const handleScrollToCard = () => {
    const e = document.getElementById("card-id");
    if (e) {
      e.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <Box className="mt-[51px] pb-10 relative">
      <svg
        className="absolute top-[-50%] left-[-50%]"
        xmlns="http://www.w3.org/2000/svg"
        width="200%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 948.8 291.9"
        fill='url("#SHAPE6_desktop_gradient")'>
        <defs id="SHAPE6_defs">
          <radialGradient
            id="SHAPE6_desktop_gradient"
            gradientTransform="rotate(0)">
            <stop offset="0%" stop-color="#FFFFFF"></stop>
            <stop offset="100%" stop-color="#FFF3F3"></stop>
          </radialGradient>
        </defs>
        <defs>
          <style></style>
        </defs>
        <path
          className="cls-1 shape_dTwYcPWnKq"
          d="M572.4,291.4H360.6a213.7,213.7,0,0,1-157.3-68.8L.2,1.8H934L729.3,223A213.7,213.7,0,0,1,572.4,291.4Z"
          transform="translate(-0.2 0.5)"></path>
        <path
          className="cls-2 shape_dTwYcPWnKq"
          d="M572.4,286.1H360.6c-59.8,0-116.9-24.5-157.3-67.6L.2,1.8H934L729.3,219C688.9,261.8,632.1,286.1,572.4,286.1Z"
          transform="translate(-0.2 0.5)"></path>
        <path
          className="cls-3 shape_dTwYcPWnKq"
          d="M581.6,283.1H366.4c-60.8,0-118.8-24.5-159.8-67.4L.2-.5H949L741,216.1C700,258.8,642.2,283.1,581.6,283.1Z"
          transform="translate(-0.2 0.5)"></path>
      </svg>
      <Container>
        <Box py={12}>
          <Flex
            mx="auto"
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between">
            <Box
              flex={1}
              className="min-w-[600px] text-center md:text-left flex justify-center flex-col items-center">
              <Text
                className=" font-semibold text-lg mb-2"
                style={{
                  fontSize: "26px",
                  color: "rgb(251, 65, 65)",
                  fontFamily: "Play, sans-serif",
                }}>
                MỜI CƯỚI THỜI 5.0
              </Text>
              {/* <br /> */}
              <p
                style={{
                  fontFamily: '"Paytone One", sans-serif',
                }}
                className="font-extrabold text-gray-900 leading-tight text-[30px] md:text-[55px]">
                TẠO THIỆP CƯỚI ĐIỆN TỬ
              </p>
              <p
                className="text-red-500 text-[28px] md:text-[50px]"
                style={{
                  fontFamily: '"Paytone One", sans-serif',
                }}>
                HOÀN TOÀN MIỄN PHÍ
              </p>

              <Text
                className="mt-4 text-xl text-gray-700 text-center text-[20px] md:text-[30px]"
                style={{
                  fontFamily: "Quicksand, sans-serif",
                }}>
                Cho Đám Cưới của bạn trở nên
                <br />
                <span className="text-red-400 font-medium">
                  Độc Đáo
                </span> và{" "}
                <span className="text-red-400 font-medium">Đáng Nhớ</span> hơn ♥
              </Text>

              <Stack
                mt={6}
                direction={{ base: "column", sm: "row" }}
                justify={{ base: "center", md: "flex-start" }}
                gap={{ base: 3, sm: 5, md: 10 }}
              >

                <Button
                  onClick={handleScrollToCard}
                  flex="1"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  width={{ base: "100%", sm: "150px", md: "200px" }}
                  height={{ base: 5, sm: 9, md: 10 }}
                  fontWeight="bold"
                  _hover={{ bg: "red.600" }}>
                  TẠO THIỆP NGAY
                </Button>
                <Button
                  onClick={handleScrollToCard}
                  variant="outline"
                  bg="white"
                  borderRadius="full"
                  colorScheme="red"
                  fontWeight="bold"
                  width={{ base: "100%", sm: "250px", md: "200px" }}
                  height={{ base: 5, sm: 9, md: 10 }}
                  borderColor={"red.400"}
                  flex="1">
                  XEM CÁC MẪU THIỆP
                </Button>
              </Stack>
            </Box>

            <Box
              position="relative"
              className=" flex justify-center items-center  md:min-w-[660px]">
              <Image
                src="/anh1.png"
                alt="Laptop"
                className=" md:w-[660px] drop-shadow-xl md:h-[584px]"
              />
              <Image
                src="/happy-wedding.png"
                alt="Phone"
                className="absolute left-[15%] md:left-[100px] w-[160px] h-[62px] top-[40px] md:w-[265px] md:h-[97px]"
              />
            </Box>
          </Flex>
        </Box>

        <Container
          maxW={"6xl"}
          className="flex items-center justify-center flex-wrap flex-col-reverse md:flex-row md:flex-nowrap">
          <Image src="/clip.webp" width={"348px"} height={"600px"} />
          <Box
            bg="#f8f8f8"
            boxShadow="2xl"
            rounded="xl"
            maxW="600px"
            w="100%"
            // textAlign="center" // 👈 căn giữa toàn bộ chữ
            p={{ base: 4, md: 6 }}
            ml={{ md: -10 }} // tương đương md:ml-[-40px]>
            borderTop="4px solid #f8f8f8"
            borderBottom="4px solid #f8f8f8"
            borderRight="4px solid #f8f8f8"
            // Border radius responsive
            borderRadius={{ base: '20px', md: '0 20px 20px 0' }}
          >
            <Text
              className="font-bold text-[#f35151] mb-2 transform transition-transform duration-300"
              fontSize="16px"
              color={"rgb(230, 128, 128)"}
              fontFamily={'"Montserrat", sans-serif'}
              >
              Giới thiệu
            </Text>

            <Heading
              as="h2"
              className="text-[#f35151] font-bold transform transition-transform duration-300"
              fontSize={{ base: "xl", md: "2xl" }}
              fontFamily={'Quicksand, sans-serif'}
              color={"rgb(255, 92, 92)"}
              mb={4}>
              Website Đám Cưới - Thiệp cưới Online
            </Heading>

            <Text
              fontSize="md"
              color="rgb(0, 0, 0)"
              lineHeight="1.6"
              textAlign="justify"
              className="transform transition-transform duration-300"
              fontFamily={'"Quicksand", sans-serif'}
              >
              Thiệp cưới online, Thiệp cưới điện tử, Website đám cưới là 1 trang
              web dành riêng cho đám cưới của các cặp đôi. Nơi dùng để lưu trữ
              những khoảnh khắc, kỷ niệm, hình ảnh, video cưới 1 cách mãi mãi.
              <br />
              Là trang web dùng để mời cưới tới bạn bè và người thân thay cho
              những chiếc thiệp giấy cổ điển, là chiếc thiệp cưới thời 5.0 với
              rất nhiều tính năng và sự hữu ích. Nơi cung cấp đầy đủ các thông
              tin cưới cho khách mời của bạn, giúp bạn dễ dàng chia sẻ đến mọi
              người, mời cưới để đánh sánh điệu, lưu trữ và chia sẻ câu chuyện
              tình yêu, album ảnh cưới đến mọi người. Cho phép mọi người gửi lời
              chúc mừng, gửi tiền mừng cưới online, và có thể xác nhận tham dự
              đám cưới của bạn,...thật tuyệt phải không !!
            </Text>
          </Box>
        </Container>
      </Container>
    </Box>
  );
};

export default CreateFreeCardsBannerSection;
