import { useSelector } from "react-redux";
import {
  FiUser,
  FiFileText,
  FiCalendar,
  FiLogOut,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import {
  Box,
  Button,
  Popover,
  Portal,
  Text,
  HStack,
  Icon,
  VStack,
  useDisclosure,
  UseDisclosureProps,
} from "@chakra-ui/react";

import Avatar from "@/assets/icons/avatar";
import { toaster } from "@/components/ui/toaster";
import { useLogout } from "@/features/auth/authAPI";
import { selectAuth } from "@/features/auth/authSlice";
import ModalGuest from "@/components/modal/ModalGuest";
import ModalInvitation from "@/components/modal/ModalInvitation";

const AccountPopover = () => {
  const auth: any = useSelector(selectAuth);
  const logoutMutation = useLogout();
  const {
    open: openInvitation,
    onOpen: onOpenInvitation,
    onClose: onCloseInvitation,
  }: UseDisclosureProps = useDisclosure();
  const {
    open: openGuest,
    onOpen: onOpenGuest,
    onClose: onCloseGuest,
  }: UseDisclosureProps = useDisclosure();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toaster.create({
        title: "Đăng xuất thành công",
        type: "success",
      });
    } catch (error) {
      toaster.create({
        title: "Đăng xuất thất bại",
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại sau.",
        type: "error",
      });
    }
  };

  const actions = [
    {
      icon: FiUser,
      title: "Quản lý tài khoản",
      desc: "Thông tin cá nhân",
      bg: "#E0E7FF",
      color: "#3B49DF",
    },
    {
      icon: FiCalendar,
      title: "Quản lý thiệp cưới",
      desc: "Thiệp của bạn",
      bg: "#FFE8E8",
      color: "#E03B3B",
      onClick: onOpenInvitation,
    },
    {
      icon: FiFileText,
      title: "Quản lý khách mời",
      desc: "Danh sách khách mời",
      bg: "#FFF4E5",
      color: "#F59E0B",
      onClick: onOpenGuest,
    },
    {
      icon: FiSettings,
      title: "Cài đặt",
      desc: "Tùy chỉnh ứng dụng",
      bg: "#E6F4EA",
      color: "#38A169",
    },
  ];

  return (
    <>
      <ModalGuest open={openGuest} onClose={onCloseGuest} />
      <ModalInvitation open={openInvitation} onClose={onCloseInvitation} onOpenGuest={onOpenGuest}/>
      <Popover.Root>
        <Popover.Trigger asChild>
          <Box
            as="button"
            className="bg-[#F6F6F6] text-black rounded-3xl h-[40px] border border-gray-300 font-semibold px-[12px] flex items-center gap-2 hover:bg-red-400 hover:text-white font-[Quicksand,sans-serif]"
          >
            <Avatar />
            <Text ml="5px">{auth?.user?.username || "Tài khoản"}</Text>
            <FiChevronDown />
          </Box>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content className="!w-[280px] rounded-xl shadow-xl overflow-hidden focus:outline-none">
              <Box className="bg-gradient-to-b from-[#FF6B6B] to-[#FF8787] py-4 px-4 text-center font-[Quicksand,sans-serif]">
                <Box className="flex justify-center mb-2">
                  <Avatar size={40} />
                </Box>
                <Text className="text-white font-medium">Xin chào 👋</Text>
                <Text className="text-white font-bold">
                  {auth?.user?.username || "Tài khoản"}
                </Text>
                <Text className="text-white text-sm">
                  @{auth?.user?.username?.toLowerCase() || "admin"}
                </Text>
              </Box>
              <VStack align="stretch" px={4} py={2} bg="white">
                {actions.map((item, index) => (
                  <Box
                    key={index}
                    className="px-2 py-2 rounded-md"
                    onClick={() =>
                      item.onClick
                        ? item.onClick?.()
                        : toaster.create({
                            title: "Chức năng này chưa được triển khai",
                            type: "info",
                          })
                    }
                    _hover={{ bg: "gray.100", cursor: "pointer" }}
                  >
                    <HStack>
                      <Box
                        bg={item.bg}
                        border={`1px solid ${item.bg}`}
                        className="rounded-[10px] p-[6px] mr-[10px] flex items-center justify-center"
                      >
                        <Icon as={item.icon} boxSize={4.5} color={item.color} />
                      </Box>
                      <Box className="font-[Quicksand,sans-serif]">
                        <Text className="font-bold text-[13px] md:text-[15px]">
                          {item.title}
                        </Text>
                        <Text className="text-[13px] text-gray-500">
                          {item.desc}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
              <Box className="h-px bg-gray-200 mx-5 my-1" />
              <Box className="px-4 py-3 bg-white">
                <Button
                  w="full"
                  bg="red.50"
                  colorScheme="red"
                  variant="outline"
                  borderRadius="xl"
                  fontWeight="bold"
                  color="red.500"
                  borderColor="red.500"
                  onClick={handleLogout}
                  fontFamily={'"Quicksand", sans-serif'}
                  _hover={{
                    bg: "red.100",
                    transform: "scale(1.02)",
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  <FiLogOut />
                  Đăng xuất
                </Button>
              </Box>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </>
  );
};

export default AccountPopover;
