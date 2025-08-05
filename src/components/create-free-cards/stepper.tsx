import { Box, Container, Flex, Image, Text } from "@chakra-ui/react";

const CreateFreeCardsStepperSection = () => {
  return (
    <Box
      style={{
        backgroundColor: "#fff4f4",
      }}
    >
      <Container maxW={"6xl"} className="pt-10 pb-10">
        <Text
          style={{
            color: "rgb(230, 128, 128)",
            // fontSize: "40px",
            paddingBottom: '10px',
            fontFamily: '"Paytone One", sans-serif',
          }}
          fontSize={["28px", "32px", "40px"]}
          fontWeight={"bold"}
          className="text-center"
          fontFamily={'"Paytone One", sans-serif'}
        >
          4 BƯỚC ĐỂ TẠO THIỆP CƯỚI ĐIỆN TỬ MIỄN PHÍ
        </Text>
        <Box
          className="flex flex-col md:flex-row gap-8 px-4"
          alignItems="center"
        >
          {/* Cột trái: Các bước */}
          <Box className="w-full md:w-2/5 flex flex-col gap-4 pt-0">
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
              ];

              return (
                <Flex
                  key={step}
                  bg="white"
                  borderRadius="md"
                  p={2}
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
                        // fontSize: "32px",
                        fontWeight: "bold",
                        marginLeft: "5px",
                      }}
                      fontSize={["24px", "24px", "32px"]}
                      fontFamily={'"Quicksand", sans-serif'}
                    >
                      {step}
                    </Text>
                  </Box>

                  <Box className="min-w-0">
                    <Text
                      fontWeight="bold"
                      fontSize={["13px", "14px", "16px"]}
                      fontFamily={'"Quicksand", sans-serif'}
                    >
                      {steps[step - 1].title}
                    </Text>
                    <Text
                      fontSize={["13px", "14px", "14px"]}
                      color="gray.700"
                      marginRight='10px'
                      fontFamily={'"Quicksand", sans-serif'}
                      textAlign="justify"
                    >
                      {steps[step - 1].desc}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </Box>

          {/* Cột phải: Hình ảnh */}
          <Box className="w-full md:w-3/5 flex justify-center items-center">
            <Image
              src="/anh2.png"
              alt="Ảnh minh họa"
              className="w-full max-w-[550px] h-auto object-contain"
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateFreeCardsStepperSection;
