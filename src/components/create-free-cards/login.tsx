import { Box, Input, Text, Button } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { keyframes } from "@emotion/react";
import { FiX, FiArrowLeft } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { useLogin } from "@/features/auth/authAPI";
import { toaster } from "@/components/ui/toaster";

const CreateFreeLoginDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const loginMutation = useLogin();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const registerEmailRef = useRef<HTMLInputElement>(null);
  const registerUsernameRef = useRef<HTMLInputElement>(null);
  const registerPasswordRef = useRef<HTMLInputElement>(null);
  const registerConfirmPasswordRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formType, setFormType] = useState<"login" | "register" | "forgot">(
    "login"
  );

  useEffect(() => {
    if (isOpen) {
      setFormType("login");
      setShowPassword(false);
    }
  }, [isOpen]);

  const slideIn = keyframes`
  0% { transform: translate(-50%, -60%) scale(0.95); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
`;

  const slideOut = keyframes`
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -30%) scale(0.95); opacity: 0; }
`;
  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = usernameRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    try {
      await loginMutation.mutateAsync({ username, password });
      toaster.create({
        title: "Đăng nhập thành công",
        type: "success",
      });
      onClose();
    } catch (error) {
      toaster.create({
        title: "Đăng nhập thất bại",
        description: "Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.",
        type: "error",
      });
    }
  };

  const handleSubmitRegister = (e: React.FormEvent) => {};

  const handleSubmitForgot = (e: React.FormEvent) => {};

  if (!isOpen) return null;

  return (
    <>
      <Box onClick={onClose} className="fixed inset-0 bg-black/60 z-[100001]" />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        borderRadius="xl"
        boxShadow="xl"
        zIndex={100001}
        p={6}
        width="90%"
        maxW="400px"
        h="auto"
        onClick={(e) => e.stopPropagation()}
        animation={`${isOpen ? slideIn : slideOut} 0.3s ease-in-out`}
      >
        {formType === "login" && (
          <form onSubmit={handleSubmitLogin}>
            <Box className="mb-4 flex justify-between items-center">
              <Text className="text-2xl font-bold font-[Quicksand]">
                Đăng nhập
              </Text>
              <Box
                onClick={onClose}
                className="cursor-pointer text-gray-600 hover:text-red-500"
              >
                <FiX size={24} />
              </Box>
            </Box>
            <Box className="mb-3 rounded-xl pb-[10px]">
              <Text className="mb-1 pb-[5px] font-[Quicksand]">
                Địa chỉ email{" "}
                <Text as="span" className="text-red-500 font-bold">
                  *
                </Text>
              </Text>
              <Input
                required
                autoComplete="off"
                placeholder="Nhập địa chỉ email"
                ref={usernameRef}
                className="bg-[#F5EEED] !rounded-xl border border-gray-300 font-[Quicksand] focus:border-red-600 focus:outline-none"
              />
            </Box>
            <Box className="mb-3 pb-[10px] relative">
              <Text className="mb-1 pb-[5px] font-[Quicksand]">
                Mật khẩu{" "}
                <Text as="span" className="text-red-500 font-bold">
                  *
                </Text>
              </Text>
              <Input
                required
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                placeholder="Nhập mật khẩu"
                ref={passwordRef}
                className="bg-[#F5EEED] !rounded-xl font-[Quicksand] pr-[40px] focus:border-red-600"
              />
              <Box
                onClick={handleTogglePassword}
                className="absolute top-[44px] right-[12px] cursor-pointer text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={4}>
              <Text
                onClick={() => setFormType("register")}
                className="text-red-500 cursor-pointer text-[14px] md:text-[15px] font-[Quicksand] hover:text-red-600 hover:font-bold hover:scale-[1.05] transition-transform duration-200"
              >
                Chưa có tài khoản
              </Text>
              <Text
                onClick={() => setFormType("forgot")}
                className="text-red-500 cursor-pointer text-[14px] md:text-[15px] font-[Quicksand] hover:text-red-600 hover:font-bold hover:scale-[1.05] transition-transform duration-200"
              >
                Quên mật khẩu
              </Text>
            </Box>
            <Button
              type="submit"
              className="!w-full !bg-red-500 !text-white !rounded-xl !font-bold !text-[16px] md:text-[14px] !font-[Quicksand] !hover:bg-red-600 !transition-colors duration-200"
              loading={loginMutation.isPending}
              loadingText="Đang đăng nhập"
            >
              Đăng nhập
            </Button>
          </form>
        )}
        {formType === "register" && (
          <form onSubmit={handleSubmitRegister}>
            <Box
              mb={4}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize="2xl" fontWeight="bold" fontFamily="Quicksand">
                Đăng ký
              </Text>
              <Box
                cursor="pointer"
                onClick={() => setFormType("login")}
                color="gray.600"
                _hover={{ color: "red.500" }}
              >
                <FiArrowLeft size={24} />
              </Box>
            </Box>
            <Text mb={1} fontFamily={'"Quicksand", sans-serif'} pb="5px">
              Địa chỉ email{" "}
              <Text as="span" color="red.500" fontWeight={"bold"}>
                *
              </Text>
            </Text>
            <Input
              ref={registerEmailRef}
              required
              placeholder="Email"
              mb={3}
              bg="#F5EEED"
              borderRadius="xl"
              type="email"
              fontFamily="Quicksand"
              fontSize={["14px", "14px", "15px"]}
            />
            <Text mb={1} fontFamily={'"Quicksand", sans-serif'} pb="5px">
              Mật khẩu{" "}
              <Text as="span" color="red.500" fontWeight={"bold"}>
                *
              </Text>
            </Text>
            <Input
              ref={registerPasswordRef}
              required
              placeholder="Mật khẩu"
              mb={3}
              bg="#F5EEED"
              borderRadius="xl"
              type="password"
              fontFamily="Quicksand"
              fontSize={["14px", "14px", "15px"]}
            />
            <Text mb={1} fontFamily={'"Quicksand", sans-serif'} pb="5px">
              Xác nhận mật khẩu{" "}
              <Text as="span" color="red.500" fontWeight={"bold"}>
                *
              </Text>
            </Text>
            <Input
              ref={registerConfirmPasswordRef}
              required
              placeholder="Nhập lại mật khẩu"
              mb={4}
              bg="#F5EEED"
              borderRadius="xl"
              type="password"
              fontFamily="Quicksand"
              fontSize={["14px", "14px", "15px"]}
            />
            <Button
              type="submit"
              width="full"
              bg="red.500"
              color="white"
              borderRadius="xl"
              fontWeight="bold"
              _hover={{ bg: "red.600" }}
            >
              Đăng ký
            </Button>
          </form>
        )}
        {formType === "forgot" && (
          <form onSubmit={handleSubmitForgot}>
            <Box
              mb={4}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize="2xl" fontWeight="bold" fontFamily="Quicksand">
                Quên mật khẩu
              </Text>
              <Box
                cursor="pointer"
                onClick={() => setFormType("login")}
                color="gray.600"
                _hover={{ color: "red.500" }}
              >
                <FiArrowLeft size={24} />
              </Box>
            </Box>
            <Text
              mb={2}
              fontFamily="Quicksand"
              textAlign={"center"}
              fontSize={["14px", "14px", "14px"]}
            >
              Nhập địa chỉ email của bạn để khôi phục mật khẩu:
            </Text>
            <Input
              ref={forgotEmailRef}
              required
              placeholder="Nhập email"
              mb={4}
              bg="#F5EEED"
              borderRadius="xl"
              type="email"
              fontFamily="Quicksand"
              fontSize={["14px", "14px", "15px"]}
              _focus={{ borderColor: "red.500" }}
            />
            <Button
              type="submit"
              width="full"
              bg="red.500"
              color="white"
              borderRadius="xl"
              fontWeight="bold"
              _hover={{ bg: "red.600" }}
            >
              Gửi liên kết khôi phục
            </Button>
          </form>
        )}
      </Box>
    </>
  );
};

export default CreateFreeLoginDialog;
