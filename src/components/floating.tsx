import { Box, Circle, Image, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FcPhone } from "react-icons/fc";
import { FaEnvelope } from "react-icons/fa";
import Zalo from "../assets/icons/zalo";
import Gmail from "../assets/icons/gmail";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useEffect, useState, useRef } from "react";

const pulse = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const shakeAndPulse = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  20% { transform: scale(1.1) rotate(2deg); }
  40% { transform: scale(0.95) rotate(-2deg); }
  60% { transform: scale(1.05) rotate(1deg); }
  80% { transform: scale(0.97) rotate(-1deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const slideOutLeft = keyframes`
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-100%); opacity: 0; }
`;

const slideInRight = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const slideInPopup = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const slideOutPopup = keyframes`
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

export default function FloatingWidget() {
  const [isMessenger, setIsMessenger] = useState(true);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSlidingOut(true);
      setTimeout(() => {
        setShowIcon(false);
        setIsMessenger((prev) => !prev);
        setTimeout(() => {
          setShowIcon(true);
          setIsSlidingOut(false);
        }, 10);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const contacts = [
    {
      key: "phone",
      icon: <FcPhone size={22} />,
      title: "Liên hệ số điện thoại",
      desc: "0818 090 333",
      onClick: () => window.open("tel:0818090333", "_blank"),
    },
    {
      key: "zalo",
      icon: <Zalo />,
      title: "Chat Zalo",
      desc: "0818 090 333 / 0848 753 999",
      onClick: () => window.open("https://zalo.me/0818090333", "_blank"),
    },
    {
      key: "facebook",
      icon: <Image src="/messenger.svg" boxSize="30px" />,
      title: "Chat Facebook",
      desc: "@meweddingg",
      onClick: () => window.open("https://m.me/meweddingg", "_blank"),
    },
    {
      key: "email",
      icon: <Gmail />,
      title: "Email",
      desc: "meweddingg@gmail.com",
      onClick: () =>
        window.open(
          "https://mail.google.com/mail/?view=cm&to=meweddingg@gmail.com",
          "_blank"
        ),
    },
    {
      key: "design",
      icon: <MdDriveFileRenameOutline size={24} />,
      title: "Thiết kế hộ",
      desc: "meWeddingg Design",
      onClick: () => window.open("https://zalo.me/0818090333", "_blank"),
    },
  ];

  return (
    <>
      <Box
        className="border border-blue-400 fixed bottom-[5%] right-[1%] border-1"
        rounded="md"
        p={1}
        bg="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        w="fit-content"
        animation={`${pulse} 2s ease-in-out infinite`}
      >
        <Box
          animation={`${shakeAndPulse} 1.5s ease-in-out infinite`}
          onClick={() => {}}
        >
          <Image src="/icon-question.png" boxSize="50px" />
        </Box>
        <Circle
          size="40px"
          bg="gray.200"
          overflow="hidden"
          position="relative"
          onClick={() => setShowPopup((prev) => !prev)}
          cursor="pointer"
        >
          {showIcon && (
            <Box
              key={isMessenger ? "messenger" : "zalo"}
              animation={
                isSlidingOut
                  ? `${slideOutLeft} 0.3s ease`
                  : `${slideInRight} 0.3s ease`
              }
              position="absolute"
            >
              {isMessenger ? (
                <Image src={"/messenger.svg"} boxSize="30px" />
              ) : (
                <Zalo />
              )}
            </Box>
          )}
        </Circle>
      </Box>

      {showPopup && (
        <Box
          ref={popupRef}
          position="fixed"
          bottom="155px"
          bg="white"
          boxShadow="lg"
          borderRadius="md"
          p={4}
          zIndex={9999}
          w={["250px", "270px", "270px"]} 
          className="fixed bottom-[21%] right-[1%]"
          animation={`${
            showPopup ? slideInPopup : slideOutPopup
          } 0.3s ease forwards`}
        >
          {contacts.map(({ key, icon, title, desc, onClick }) => (
            <Box
              key={key}
              display="flex"
              alignItems="center"
              gap={3}
              mt={key !== "phone" ? 4 : 0}
              onClick={onClick}
              cursor={"pointer"}
            >
              <Circle
                size="40px"
                bg="gray.200"
                overflow="hidden"
                position="relative"
              >
                <Box animation={`${shakeAndPulse} 1.5s ease-in-out infinite`}>
                  {icon}
                </Box>
              </Circle>
              <Box>
                <Text
                  fontWeight="bold"
                  fontFamily={'"Quicksand", sans-serif'}
                  fontSize={["12px", "13px", "14px"]}
                >
                  {title}
                </Text>
                <Text
                  fontFamily={'"Quicksand", sans-serif'}
                  fontSize={["12px", "13px", "14px"]}
                >
                  {desc}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
