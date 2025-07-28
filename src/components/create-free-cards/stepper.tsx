import { Box, Container, Flex, Image, Text } from "@chakra-ui/react";

const CreateFreeCardsStepperSection = () => {
  return (
    <Box
      style={{
        backgroundColor: "#fff4f4",
      }}>
      <Container maxW={"6xl"} className="pt-10 pb-10">
        <Text
          style={{
            color: "rgb(230, 128, 128)",
            fontSize: "40px",
            fontFamily: '"Paytone One", sans-serif',
          }}
          fontWeight={"bold"}
          className="text-center transform transition-transform duration-300 hover:scale-110"
          fontFamily={'"Paytone One", sans-serif'}
          >
          4 BƯỚC ĐỂ TẠO THIỆP CƯỚI ĐIỆN TỬ MIỄN PHÍ
        </Text>
        <Box className="flex flex-col md:flex-row gap-8 px-4">
          {/* Cột trái: Các bước */}
          <Box className="w-full md:w-1/2 flex flex-col gap-6 pt-10">
            {[1, 2, 3, 4].map((step) => {
              const steps = [
                {
                  title: "TẠO TÀI KHOẢN VÀ ĐĂNG NHẬP",
                  desc: "Tạo tài khoản bằng vài bước đơn giản để đăng nhập vào nền tảng và bắt đầu lựa chọn mẫu thiệp vừa ý và tiến hành tạo thiệp.",
                },
                {
                  title: "LỰA CHỌN MẪU THIỆP ƯNG Ý",
                  desc: "Chọn 1 mẫu giao diện mà bạn yêu thích để tiến hành tạo thiệp.",
                },
                {
                  title: "NHẬP CÁC THÔNG TIN CƠ BẢN DÂU RỂ",
                  desc: "Nhập các thông tin của dâu rể để tiến hành tạo thiệp và chỉnh sửa, thiết kế lại thiệp theo thông tin và hình ảnh riêng của bạn.",
                },
                {
                  title: "HOÀN THÀNH VÀ MỜI KHÁCH",
                  desc: "Sau khi chỉnh sửa xong rồi, bấm lưu thiệp. Vậy là đã hoàn thành và bạn có thể gửi mời đến mọi người rồi nhé!",
                },
              ]

              return (
                <Flex
                  key={step}
                  bg="white"
                  borderRadius="md"
                  p={4}
                  align="center"
                  gap={4}
                  className="shadow-sm"
                  style={{
                    borderTopLeftRadius: "60px",
                    borderBottomLeftRadius: "60px",
                  }}
                >
                  <Box
                    className="flex justify-center items-center"
                    style={{
                      borderRadius: "100px 8px 8px 100px",
                      backgroundColor: "rgb(255, 226, 226)",
                      width: "50px",
                      height: "90px",
                      flexShrink: 0,
                    }}
                  >
                    <Text
                      style={{
                        color: "rgb(109, 106, 106)",
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginLeft: "5px",
                      }}
                      fontFamily={'"Montserrat", sans-serif'}
                    >
                      {step}
                    </Text>
                  </Box>

                  <Box className="min-w-0">
                    <Text fontWeight="bold" fontSize="md" fontFamily={'"Montserrat", sans-serif'}>
                      {steps[step - 1].title}
                    </Text>
                    <Text fontSize="sm" color="gray.700" fontFamily={'"Montserrat", sans-serif'}>
                      {steps[step - 1].desc}
                    </Text>
                  </Box>
                </Flex>
              )
            })}
          </Box>

          {/* Cột phải: Hình ảnh */}
          <Box className="w-full md:w-1/2 flex justify-center items-center">
            <Image
              src="/anh2.png"
              alt="Ảnh minh họa"
              className="transform transition-transform duration-300 hover:scale-110 max-w-full h-auto object-contain"
            />
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default CreateFreeCardsStepperSection;
