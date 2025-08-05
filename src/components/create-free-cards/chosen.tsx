import { Box, Collapsible, Container, Image, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuPlus, LuMinus } from "react-icons/lu";

const CreateFreeCardsChosenSection = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const [open5, setOpen5] = useState(false);
  const [open6, setOpen6] = useState(false);
  return (
    <Container maxW={"6xl"} className="pt-10" pt={20}>
      <Text
        style={{
          color: "rgb(232, 143, 143)",
          // fontSize: "30px",
          fontFamily: '"Paytone One", sans-serif',
        }}
        fontWeight={"bold"}
        fontSize={["18px", "24px", "30px"]}
        className="text-center transform transition-transform duration-300 hover:scale-110"
      >
        TẠI SAO NÊN LỰA CHỌN
      </Text>
      <Text
        style={{
          color: "rgb(232, 117, 117)",
          // fontSize: "45px",
          fontFamily: '"Paytone One", sans-serif',
        }}
        fontWeight={"bold"}
        fontSize={["24px", "32px", "45px"]}
        className="text-center transform transition-transform duration-300 hover:scale-110"
      >
        THIỆP CƯỚI ĐIỆN TỬ
      </Text>
      <Box
        className="grid gap-4 
                grid-cols-1 grid-rows-2 
                md:grid-cols-2 md:grid-rows-1"
      >
        <Box className="col-span-2 md:col-span-1  p-4 text-center flex flex-col gap-4">
          <Box
            style={{
              border: "2px solid rgb(232, 117, 117)",
              borderRadius: "6px",
            }}
            className="p-3 flex gap-3 items-center"
          >
            <Image src="/heart.png" className="w-[85px] h-[85px]" />
            <Box className="text-left">
              <Text fontWeight={"bold"} fontFamily={'"Quicksand", sans-serif'}>
                Lưu trữ kỷ niệm cưới 1 cách mãi mãi
              </Text>
              <Text
                fontSize="14px"
                lineHeight="1.6"
                fontFamily={'"Quicksand", sans-serif'}
                color={"rgb(0, 0, 0)"}
              >
                Dễ dàng chia sẽ Album ảnh cưới, câu chuyện tình yêu của bạn.
                Giúp bạn lưu giữ những khoảnh khắc tuyệt vời của mình trong ngày
                trọng đại mãi mãi. Thật tuyệt vời nếu như đôi lúc bạn có thể mở
                ra và ngắm nhìn lại nó.
              </Text>
            </Box>
          </Box>
          <Box
            style={{
              border: "2px solid rgb(232, 117, 117)",
              borderRadius: "6px",
            }}
            className="p-3 flex gap-3 items-center"
          >
            <Image src="/heart.png" className="w-[85px] h-[85px]" />
            <Box className="text-left">
              <Text fontWeight={"bold"} fontFamily={'"Quicksand", sans-serif'}>
                Dễ dàng mời gửi mà không cần đi lại
              </Text>
              <Text
                fontSize={"sm"}
                fontFamily={'"Quicksand", sans-serif'}
                color={"rgb(0, 0, 0)"}
              >
                Dễ dàng mời gửi đến bạn bè và người thân ở khắp mọi nơi qua các
                kênh online mà không cần đi lại. Chia sẽ Album ảnh cưới ,câu
                chuyện tình yêu và những khoảnh khắc đẹp cho mọi người. Khoe
                cưới thời 5.0
              </Text>
            </Box>
          </Box>
          <Box
            style={{
              border: "2px solid rgb(232, 117, 117)",
              borderRadius: "6px",
            }}
            className="p-3 flex gap-3 items-center"
          >
            <Image src="/heart.png" className="w-[85px] h-[85px]" />
            <Box className="text-left">
              <Text fontWeight={"bold"} fontFamily={'"Quicksand", sans-serif'}>
                Rất nhiều tính năng được sử dụng
              </Text>
              <Text
                fontSize={"sm"}
                fontFamily={'"Quicksand", sans-serif'}
                color={"rgb(0, 0, 0)"}
              >
                Những tính năng tuyệt vời chỉ có ở thiệp điện tử như "Gửi lời
                chúc mừng cưới, Xác nhận tham dự cưới, Google Maps, Đếm ngược
                thời gian đến ngày cưới, Phát nhạc trên thiệp, Mừng cưới
                online,......
              </Text>
            </Box>
          </Box>
        </Box>
        <Box className="col-span-2 md:col-span-1  p-4 text-center flex flex-col gap-4">
          <Box
            style={{
              border: "2px solid rgb(232, 117, 117)",
              borderRadius: "6px",
            }}
            className="p-3 flex gap-3 items-center"
          >
            <Image src="/heart.png" className="w-[85px] h-[85px]" />
            <Box className="text-left">
              <Text fontWeight={"bold"} fontFamily={'"Quicksand", sans-serif'}>
                Đa dạng mẫu mã, tùy biến theo sở thích
              </Text>
              <Text
                fontSize={"sm"}
                fontFamily={'"Quicksand", sans-serif'}
                color={"rgb(0, 0, 0)"}
              >
                Giao diện đẹp và đa dạng, được meWedding cập nhật thường xuyên.
                Cho bạn thoải mái lựa chọn và điều chỉnh không giới hạn theo sở
                thích và phong cách riêng của mình. Cho bạn những trải nghiệm
                tuyệt vời.
              </Text>
            </Box>
          </Box>
          <Box
            style={{
              border: "2px solid rgb(232, 117, 117)",
              borderRadius: "6px",
            }}
            className="p-3 flex gap-3 items-center"
          >
            <Image src="/heart.png" className="w-[85px] h-[85px]" />
            <Box className="text-left">
              <Text fontWeight={"bold"} fontFamily={'"Quicksand", sans-serif'}>
                Tiết kiệm chi phí và thời gian
              </Text>
              <Text
                fontSize={"sm"}
                fontFamily={'"Quicksand", sans-serif'}
                color={"rgb(0, 0, 0)"}
              >
                Không cần in ấn hay gửi thiệp qua bưu điện. Giúp bạn giảm thiểu
                chi phí và thời gian chuẩn bị. Mời cưới bằng thiệp điện tử sẽ
                sang trọng, đầy đủ và chỉn chu hơn rất nhiều. Không giới hạn số
                lượng khách mời hay thời gian
              </Text>
            </Box>
          </Box>
          <Box
            style={{
              border: "2px solid rgb(232, 117, 117)",
              borderRadius: "6px",
            }}
            className="p-3 flex gap-3 items-center"
          >
            <Image src="/heart.png" className="w-[85px] h-[85px]" />
            <Box className="text-left">
              <Text fontWeight={"bold"} fontFamily={'"Quicksand", sans-serif'}>
                Quản lý kế hoạch cưới 1 cách chủ động
              </Text>
              <Text
                fontSize={"sm"}
                fontFamily={'"Quicksand", sans-serif'}
                color={"rgb(0, 0, 0)"}
              >
                Quản lý số lượng khách mời tham dự tiệc cưới của bạn thông qua
                tính năng R.S.V.P để đón tiếp và chuẩn bị chu đáo hơn. Hướng dẫn
                khách mời tới địa điểm cưới chỉ bằng 1 click. Giúp bạn chủ động
                hơn trong mọi việc.
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        pt={5}
        id="question-id"
        className="grid gap-4 
                grid-cols-1 md:grid-cols-12  
                mt-15 mb-10"
      >
        <Box className="col-span-12 md:col-span-7 p-4 text-center flex flex-col">
          <Box
            style={{
              color: "rgb(232, 117, 117)",
              fontFamily: '"Paytone One", sans-serif',
            }}
            className="w-fit"
            fontSize={["23px", "24px", "30px"]}
            fontWeight="bold"
          >
            NHỮNG CÂU HỎI THƯỜNG GẶP
            <Box
              as="div"
              style={{
                backgroundColor: "rgb(232, 117, 117)",
              }}
              className="py-[3px] w-[120px] mb-[15px]"
            />
          </Box>
          <Collapsible.Root
            open={open1}
            onOpenChange={(value) => setOpen1(value.open)}
            className="w-full"
          >
            <Collapsible.Trigger
              className="w-full"
              paddingY={"2"}
              onClick={() => {}}
            >
              <Box
                style={{
                  backgroundColor: "rgb(255, 226, 226)",
                }}
                className="text-left cursor-pointer px-8 py-2 flex justify-between items-center"
              >
                <Text
                  fontWeight={"semibold"}
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Website đám cưới, thiệp cưới điện tử là gì ?
                </Text>
                <Box fontSize="12" paddingLeft="5px">
                  {open1 ? <LuMinus /> : <LuPlus />}
                </Box>
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box
                style={{
                  backgroundColor: "rgb(241, 243, 244)",
                }}
                className="p-8"
              >
                <Text
                  className="text-justify"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Website đám cưới, thiệp cưới online là 1 trang web dành riêng
                  cho đám cưới của các cặp đôi. Nơi dùng để lưu trữ những khoảnh
                  khắc, kỷ niệm, hình ảnh cưới 1 cách mãi mãi. Là trang web dùng
                  để mời cưới tới bạn bè và người thân thay cho những chiếc
                  thiệp giấy cổ điển, là chiếc thiệp cưới thời 5.0 với rất nhiều
                  tính năng và sự hữu ích. Giúp bạn mời cưới dễ dàng sành điệu,
                  lưu trữ và chia sẽ câu chuyện tình yêu, album ảnh cưới đến mọi
                  người. Cho phép mọi người gửi lời chúc, gửi tiền mừng cưới
                  online, và có thể xác nhận tham dự,...giúp bạn quản lý kế
                  hoạch cưới dễ dàng. Đám cưới của bạn sẽ trở nên đặc biệt hơn
                  với mọi người.
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
          <Collapsible.Root
            className="w-full"
            open={open2}
            onOpenChange={(value) => setOpen2(value.open)}
          >
            <Collapsible.Trigger className="w-full" paddingY={"2"}>
              <Box
                style={{
                  backgroundColor: "rgb(255, 226, 226)",
                }}
                className="text-left cursor-pointer px-8 py-2 flex justify-between items-center"
              >
                <Text
                  fontWeight={"semibold"}
                  className="max-w-[500px]"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Tôi cần chuẩn bị những gì để bắt đầu có 1 chiếc thiệp cưới ?
                </Text>
                <Box fontSize="12" paddingLeft="5px">
                  {open2 ? <LuMinus /> : <LuPlus />}
                </Box>
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box
                style={{
                  backgroundColor: "rgb(241, 243, 244)",
                }}
                className="p-8"
              >
                <Text
                  className="text-justify"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Bạn cần chuẩn bị Album ảnh cưới, video cưới nếu có để có thể
                  chia sẻ đến mọi người. Một câu chuyện tình yêu đơn giản tự bạn
                  viết. Các thông tin dâu rể và nội ngoại kèm ngày cưới cùng 1
                  vài thông tin cần thiết. Sau đấy thì tự tay tạo cho mình 1
                  chiếc thiệp cực xinh và ưng ý nhất thôi ^^!
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
          <Collapsible.Root
            className="w-full"
            open={open3}
            onOpenChange={(value) => setOpen3(value.open)}
          >
            <Collapsible.Trigger className="w-full" paddingY={"2"}>
              <Box
                style={{
                  backgroundColor: "rgb(255, 226, 226)",
                }}
                className="text-left cursor-pointer px-8 py-2 flex justify-between items-center"
              >
                <Text
                  fontWeight={"semibold"}
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Ý nghĩa của Website thiệp cưới này là gì ?
                </Text>
                <Box fontSize="12" paddingLeft="5px">
                  {open3 ? <LuMinus /> : <LuPlus />}
                </Box>
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box
                style={{
                  backgroundColor: "rgb(241, 243, 244)",
                }}
                className="p-8"
              >
                <Text
                  className="text-justify"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Website thiệp cưới hay thiệp cưới online chính là chiếc thiệp
                  hồng trao tay 5.0 thay thế cho những chiếc thiệp giấy thông
                  thường. Là nơi cung cấp đầy đủ các thông tin cưới cho khách
                  mời của bạn, giúp bạn dễ dàng chia sẻ đến mọi người, dù ở xa
                  hay gần 1 cách dễ dàng. Ngoài ra thiệp cưới online còn làm cho
                  đám cưới của bạn trở nên rộn ràng hơn trước ngày cưới với
                  những chia sẻ của bạn như: Album ảnh cưới, video cưới, gửi lời
                  chúc cho vợ chồng bạn, câu chuyện tình yêu của bạn, hay thậm
                  chí là đếm ngược thời gian để nhắc nhở khách mời, google maps
                  chỉ dẫn tận nơi cho khách dự tiệc...Đám cưới của bạn sẽ rất
                  tuyệt vời nhỉ !!
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
          <Collapsible.Root
            className="w-full"
            open={open4}
            onOpenChange={(value) => setOpen4(value.open)}
          >
            <Collapsible.Trigger className="w-full" paddingY={"2"}>
              <Box
                style={{
                  backgroundColor: "rgb(255, 226, 226)",
                }}
                className="text-left cursor-pointer px-8 py-2 flex justify-between items-center "
              >
                <Text
                  fontWeight={"semibold"}
                  className="max-w-[600px]"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Tôi có thể thay đổi thiết kế hoặc thông tin thiệp cưới sau khi
                  nó đã hoàn thành và đã bàn giao không ?
                </Text>
                <Box fontSize="12" paddingLeft="10px">
                  {open4 ? <LuMinus /> : <LuPlus />}
                </Box>
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box
                style={{
                  backgroundColor: "rgb(241, 243, 244)",
                }}
                className="p-8"
              >
                <Text
                  className="text-justify"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Dâu Rể hoàn toàn có thể thay đổi cho đến khi vừa ý kể các khi
                  thiệp đã được bàn giao cho bạn, meWedding luôn mong muốn bạn
                  sẽ có 1 đám cưới thật tuyệt vời và hoàn mỹ nhất, nên đừng ngần
                  ngại liên hệ với meWedding để được hỗ trợ khi cần thiết nhé
                  Dâu Rể. Đội ngũ sẽ luôn túc trực hỗ trợ Dâu Rể 24/7 mọi lúc
                  mọi nơi!
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
          <Collapsible.Root
            className="w-full"
            open={open5}
            onOpenChange={(value) => setOpen5(value.open)}
          >
            <Collapsible.Trigger className="w-full" paddingY={"2"}>
              <Box
                style={{
                  backgroundColor: "rgb(255, 226, 226)",
                }}
                className="text-left cursor-pointer px-8 py-2 flex justify-between items-center"
              >
                <Text
                  fontWeight={"semibold"}
                  className="max-w-[600px]"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Tự thiết kế thiệp này có dễ không, tôi không rành về máy tính
                </Text>
                <Box fontSize="12" paddingLeft="5px">
                  {open5 ? <LuMinus /> : <LuPlus />}
                </Box>
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box
                style={{
                  backgroundColor: "rgb(241, 243, 244)",
                }}
                className="p-8"
              >
                <Text
                  className="text-justify"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Hoàn toàn rất dễ để thiết kế. Bạn chỉ cần bấm vào sửa lại các
                  thông tin đúng với của bạn. Không cần biết về thiết kế hay
                  code web bạn cũng có thể dễ dàng hoàn thành thiệp này chỉ bằng
                  vài thao tác chỉnh sửa. Bạn cũng có thể thực hiện việc đó trên
                  điện thoại hoàn toàn đơn giản.
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
          <Collapsible.Root
            className="w-full"
            open={open6}
            onOpenChange={(value) => setOpen6(value.open)}
          >
            <Collapsible.Trigger className="w-full" paddingY={"2"}>
              <Box
                style={{
                  backgroundColor: "rgb(255, 226, 226)",
                }}
                className="text-left cursor-pointer px-8 py-2 flex justify-between items-center"
              >
                <Text
                  fontWeight={"semibold"}
                  className="max-w-[400px]"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Tôi có thể gửi thiệp cho bao nhiêu người ?
                </Text>
                <Box fontSize="12" paddingLeft="5px">
                  {open6 ? <LuMinus /> : <LuPlus />}
                </Box>
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box
                style={{
                  backgroundColor: "rgb(241, 243, 244)",
                }}
                className="p-8"
              >
                <Text
                  className="text-justify"
                  fontFamily={'"Quicksand", sans-serif'}
                >
                  Thiệp cưới điện tử sẽ không giới hạn số khách mời bạn muốn
                  gửi, đây cũng là điều giúp bạn giảm được nhiều chi phí so với
                  thiệp giấy phải in ấn.
                </Text>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>
        <Box className="col-span-12 md:col-span-4 p-4 text-center flex justify-center items-center">
          <Image src="/anh3.png" className="max-w-[600px] w-full h-auto" />
        </Box>
      </Box>
    </Container>
  );
};

export default CreateFreeCardsChosenSection;
