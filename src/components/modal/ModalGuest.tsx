import {
  Box,
  Table,
  Text,
  Button,
  HStack,
  Badge,
  Select,
  Spinner,
  useBreakpointValue,
  createListCollection,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { FaGift } from "react-icons/fa6";
import { FaPencil } from "react-icons/fa6";
import { TbWorld, TbWorldOff } from "react-icons/tb";
import { BsArrowRepeat } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";

import apiClient from "@/api/apiClient";
import { toaster } from "@/components/ui/toaster";

const slideIn = keyframes`
  0% { transform: translate(-50%, -60%) scale(0.95); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  `;

const ModalGuest = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;

  const isDesktop = useBreakpointValue({ base: false, md: true });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("all");
  const [guest, setGuest] = useState<any>([]);

  useEffect(() => {
    fetchGuest();
  }, []);

  const fetchGuest = async (type?: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get("/guests", {
        params: {
          guestOf: type || "both",
        },
      });
      setGuest(response.data.data.data);
    } catch (error) {
      toaster.create({
        title: "Lỗi khi tải danh sách khách mời",
        description: "Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const iconList = [
    { icon: FaPlus, label: "Thêm mới" },
    {
      icon: BsArrowRepeat,
      label: "Làm mới dữ liệu",
      onClick: () => fetchGuest(),
    },
    { icon: FiX, label: "Đóng", onClick: onClose },
  ];

  const headerAction = [
    {
      label: "Tổng số khách",
      value: guest.length,
      icon: <FaGift />,
      color: "red.400",
      bg: "#ffe5e5",
    },
    {
      label: "Tổng tham gia",
      value: guest.length,
      icon: <TbWorld />,
      color: "#912828",
      bg: "#f1eaea",
    },
    {
      label: "Khách nhà Trai",
      value: guest?.filter((item: any) => item?.guestOf === "Groom").length,
      icon: <TbWorldOff />,
      color: "red.500",
      bg: "#ffe5e5",
    },
    {
      label: "Khách nhà gái",
      value: guest?.filter((item: any) => item?.guestOf === "Bride").length,
      icon: <FaPencil />,
      color: "olive",
      bg: "#f1ebe6",
    },
  ];

  return (
    <Box onClick={onClose} className="fixed inset-0 bg-transparent z-[100001]">
      <Box
        className="
          fixed top-1/2 left-1/2
          w-full min-h-[75vh] sm:min-h-[85vh]
          max-w-[95%] sm:max-w-[90%] md:max-w-[85%]
          bg-white rounded-2xl shadow-xl z-[100001]
        "
        transform="translate(-50%, -50%)"
        onClick={(e) => e.stopPropagation()}
        animation={`${slideIn} 0.3s ease-in-out`}
      >
        <Box className="p-6 flex items-center rounded-t-2xl bg-gradient-to-r from-[#FF5C5C] to-[#FFA3A3]">
          <Box className="cursor-pointer text-white rounded-[16px] bg-[#FF8D8D] p-3 mr-4 text-[20px] sm:text-[24px] md:text-[30px]">
            <FaGift />
          </Box>
          <Box color="white" fontFamily={'"Quicksand", sans-serif'}>
            <Text fontSize={["md", "xl", "2xl"]} fontWeight="bold">
              Quản lý khách mời
            </Text>
            <Text fontSize={["sm", "md", "lg"]}>
              Quản lý danh sách khách mời và thông tin tham dự
            </Text>
          </Box>
          <Box display="flex" gap={3} ml="auto">
            {iconList.map(({ icon: Icon, onClick, label }, index) => (
              <Box
                key={index}
                onClick={onClick}
                className="cursor-pointer text-white rounded-[8px] bg-[#FF8D8D] p-2 hover:text-red-500 text-[16px] md:text-[20px] lg:text-[24px]"
              >
                <Icon />
              </Box>
            ))}
          </Box>
        </Box>
        <Box px={4} mt={4} mb={6}>
          <Box
            display="grid"
            gridTemplateColumns={["repeat(4, 1fr)", "repeat(4, 1fr)"]}
            gap={3}
          >
            {headerAction.map((item, idx) => (
              <Box
                key={idx}
                className="rounded-lg text-center py-4 px-1 text-sm"
                style={{ backgroundColor: item.bg }}
              >
                <Box
                  color={item.color}
                  className="text-[20px] mb-1 flex justify-center"
                >
                  {item.icon}
                </Box>
                <Text
                  color={item.color}
                  className="text-lg font-bold font-[Quicksand,sans-serif]"
                >
                  {item.value}
                </Text>
                <Text className="text-gray-600 text-[14px] pt-1 font-[Quicksand,sans-serif]">
                  {item.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
        <HStack wrap="wrap" p={4} pt={0}>
          <Box
            display="flex"
            gap={4}
            w="100%"
            overflowX="scroll"
            overflowY="hidden"
            whiteSpace="nowrap"
          >
            {loading ? (
              <Box className="w-full text-center pt-5 justify-center min-h-[350px]">
                <Spinner size="lg" color="red.500" />
                <Text className="mt-4 text-gray-600 text-[12px] sm:text-[13px] md:text-[14px] font-[Quicksand,sans-serif]">
                  Đang tải danh sách khách mời...
                </Text>
              </Box>
            ) : guest?.length === 0 ? (
              <Box
                className="w-full flex mt-6 justify-center text-center text-[12px] sm:text-[13px] md:text-[14px] font-[Quicksand,sans-serif] text-gray-600"
                minH="350px"
              >
                Không có khách mời nào được tìm thấy.
              </Box>
            ) : (
              <Box>
                {isDesktop ? (
                  <Table.Root size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Tên</Table.ColumnHeader>
                        <Table.ColumnHeader>Số điện thoại</Table.ColumnHeader>
                        <Table.ColumnHeader>Email</Table.ColumnHeader>
                        <Table.ColumnHeader>Khách của</Table.ColumnHeader>
                        <Table.ColumnHeader>Số người</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="end"></Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body></Table.Body>
                  </Table.Root>
                ) : (
                  <Box></Box>
                )}
              </Box>
            )}
          </Box>
        </HStack>
      </Box>
    </Box>
  );
};

export default ModalGuest;
