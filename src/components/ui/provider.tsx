import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  useColorMode,
  type ColorModeProviderProps,
} from "./color-mode"
import { useEffect } from "react"
import system from "@/theme"

export function Provider(props: ColorModeProviderProps) {
  const { setColorMode,  } = useColorMode()
  useEffect(() => {
    setColorMode("dark")
  }, [])
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} defaultTheme=""/>
    </ChakraProvider>
  )
}
