import {
  Badge,
  Box,
  Button,
  Container,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";

const CreateFreeCardsStoreSection = () => {
  return (
    <Container maxW={"6xl"} className="mt-10 mb-10" id="card-id">
      <Text
        style={{
          color: "rgb(236, 84, 84)",
          fontSize: "45px",
          fontFamily: '"Paytone One", sans-serif',
        }}
        fontWeight={"bold"}
        className="text-center transform transition-transform duration-300 hover:scale-110">
        KHO GIAO DIỆN CÁC MẪU THIỆP CƯỚI
      </Text>
      <Text
        style={{
          fontSize: "22px",
          fontFamily: '"Paytone One", sans-serif',
          color: "rgb(78, 77, 77)",
        }}
        className="text-center mb-10 transform transition-transform duration-300 hover:scale-110">
        Bắt đầu Đám Cưới của bạn với 1 chiếc Thiệp Cưới thật đẹp ngay nhé
        ♥&nbsp;
      </Text>
      <Box
        className="grid gap-8 
                grid-cols-1 grid-rows-3 
                md:grid-cols-3 md:grid-rows-1">
        <Box className="col-span-3 md:col-span-1">
          <Box
            className="shadow-lg rounded-2xl overflow-hidden max-w-sm cursor-pointer transform transition-transform duration-300 hover:scale-110"
            border="1px"
            borderColor="gray.200"
            style={{
              backgroundColor: "#f1f3f4",
            }}>
            <Box position={"relative"}>
              <Image
                src="/anhcuoi1.png"
                alt="Wedding Template"
                objectFit="cover"
                height="300px"
                width="100%"
                className="rounded-b-none transform transition-transform duration-300 hover:scale-110"
              />
              <Box
                position={"absolute"}
                className="flex gap-2"
                right={5}
                top={"95%"}
                style={{
                  border: "1px solid red",
                  width: "50%",
                }}
                px="2"
                py="1"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="red.50"

              >

                <Text fontSize="xs" alignContent={'center'}>Giao diện MIỄN PHÍ</Text>
              </Box>
            </Box>

            <Box p="4">
              <Text fontWeight="bold" fontSize="lg" mb="1">
                Sleazy
              </Text>
              <Text fontSize="sm" color="gray.600" mb="4">
                Thiết kế đơn giản nhẹ nhàng nhưng lắng đọng, tạo sự tươi trẻ
                lãng mạng. Thiết kế tỉ mỉ và tính tế, tối ưu ở giao diện điện
                thoại.
              </Text>

              <HStack mb="2">
                <Button
                  variant="outline"
                  bg="#2196f3"
                  borderRadius="2xl"
                  colorScheme="red"
                  height={8}
                  color={"white"}
                  borderColor={"#2196f3"}
                  flex="1">
                  Xem thiệp
                </Button>
                <Button
                  flex="1"
                  bg="#ff5c5c"
                  color="white"
                  borderRadius="2xl"
                  height={8}
                  _hover={{ bg: "red.600" }}>
                  Tạo thiệp
                </Button>
              </HStack>

              <Button
                variant="ghost"
                color="white"
                bg="#616161"
                height={8}
                colorScheme="red"
                borderRadius="2xl"
                borderColor={"#616161"}
                width="100%"
                fontWeight="medium">
                Yêu cầu meWedding Thiết kế hộ
              </Button>
            </Box>
          </Box>
        </Box>
        <Box className="col-span-3 md:col-span-1">
          <Box
            className="shadow-lg rounded-2xl overflow-hidden max-w-sm cursor-pointer transform transition-transform duration-300 hover:scale-110"
            border="1px"
            borderColor="gray.200"
            style={{
              backgroundColor: "#f1f3f4",
            }}>
            <Box position={"relative"}>
              <Image
                src="/anhcuoi2.png"
                alt="Wedding Template"
                objectFit="cover"
                height="300px"
                width="100%"
                className="rounded-b-none transform transition-transform duration-300 hover:scale-110"
              />
              <Box
                position={"absolute"}
                className="flex gap-2"
                right={5}
                top={"95%"}
                style={{
                  border: "1px solid red",
                  width: "50%",
                }}
                px="2"
                py="1"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="red.50"
                color="red.500"
              >

                <Text fontSize="xs" alignContent={'center'}>Giao diện MIỄN PHÍ</Text>
              </Box>
            </Box>

            <Box p="4">
              <Text fontWeight="bold" fontSize="lg" mb="1">
                Cool
              </Text>
              <Text fontSize="sm" color="gray.600" mb="4">
                Giao diện thiết kế tươi sáng mát mẻ, tạo cảm giác dễ chịu, vui
                vẻ cho người xem. Nơi lưu giữ kỷ niệm tuyệt vời cho dâu rể.
              </Text>

              <HStack mb="2">
                <Button
                  variant="outline"
                  bg="#2196f3"
                  borderRadius="2xl"
                  colorScheme="red"
                  height={8}
                  color={"white"}
                  borderColor={"#2196f3"}
                  flex="1">
                  Xem thiệp
                </Button>
                <Button
                  flex="1"
                  bg="#ff5c5c"
                  color="white"
                  borderRadius="2xl"
                  height={8}
                  _hover={{ bg: "red.600" }}>
                  Tạo thiệp
                </Button>
              </HStack>

              <Button
                variant="ghost"
                color="white"
                bg="#616161"
                height={8}
                colorScheme="red"
                borderRadius="2xl"
                borderColor={"#616161"}
                width="100%"
                fontWeight="medium">
                Yêu cầu meWedding Thiết kế hộ
              </Button>
            </Box>
          </Box>
        </Box>
        <Box className="col-span-3 md:col-span-1">
          <Box
            className="shadow-lg rounded-2xl overflow-hidden max-w-sm cursor-pointer transform transition-transform duration-300 hover:scale-110"
            border="1px"
            borderColor="gray.200"
            style={{
              backgroundColor: "#f1f3f4",
            }}>
            <Box position={"relative"}>
              <Image
                src="/anhcuoi3.png"
                alt="Wedding Template"
                objectFit="cover"
                height="300px"
                width="100%"
                className="rounded-b-none transform transition-transform duration-300 hover:scale-110"
              />
              <Box
                position={"absolute"}
                className="flex gap-2"
                right={5}
                top={"95%"}
                style={{
                  border: "1px solid red",
                  width: "50%",
                }}
                px="2"
                py="1"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="red.50"
                color="red.500"
              >

                <Text fontSize="xs" alignContent={'center'}>Giao diện MIỄN PHÍ</Text>
              </Box>
            </Box>

            <Box p="4">
              <Text fontWeight="bold" fontSize="lg" mb="1">
                Romantic
              </Text>
              <Text fontSize="sm" color="gray.600" mb="4">
                Lãng mạn và vui vẻ là điều mà giao diện này có. Cảm giác nhẹ
                nhàng đơn giản nhưng vô cùng thích mắt. Tối ưu từng thiết kế 1
                cách tỉ mỉ.
              </Text>

              <HStack mb="2">
                <Button
                  variant="outline"
                  bg="#2196f3"
                  borderRadius="2xl"
                  colorScheme="red"
                  height={8}
                  color={"white"}
                  borderColor={"#2196f3"}
                  flex="1">
                  Xem thiệp
                </Button>
                <Button
                  flex="1"
                  bg="#ff5c5c"
                  color="white"
                  borderRadius="2xl"
                  height={8}
                  _hover={{ bg: "red.600" }}>
                  Tạo thiệp
                </Button>
              </HStack>

              <Button
                variant="ghost"
                color="white"
                bg="#616161"
                height={8}
                colorScheme="red"
                borderRadius="2xl"
                borderColor={"#616161"}
                width="100%"
                fontWeight="medium">
                Yêu cầu meWedding Thiết kế hộ
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateFreeCardsStoreSection;
