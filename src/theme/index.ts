import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
    ...defaultConfig,
    strictTokens: true,
    preflight: false,
    globalCss: {
        html: {
          colorPalette: "orange", // Change this to any color palette you prefer
        },
      },
});

const system = createSystem(defaultConfig,customConfig);

export default system;
