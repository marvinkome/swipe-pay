import { extendTheme } from "@chakra-ui/react";

export default extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    body: "Source sans pro, sans-serif",
    heading: "Source Sans Pro, sans-serif",
  },
  components: {
    Input: {
      variants: {
        outline: {
          field: {
            rounded: "18px",
            bg: "gray.700",
            border: "1px solid",
            borderColor: "rgba(25, 15, 51, 0.1)",
            boxShadow: "inset 0px 0.934426px 10px rgba(25, 15, 51, 0.2)",
            color: "whiteAlpha.900",
            px: 6,
            py: 8,
            mt: 2,

            _hover: {
              borderColor: "rgba(25, 15, 51, 0.2)",
            },

            _placeholder: {
              color: "rgb(255 255 255 / 46%)",
            },

            _focus: {
              borderColor: "rgba(25, 15, 51, 0.2)",
              outline: "none",
              boxShadow: "inset 0px 0.934426px 10px rgba(25, 15, 51, 0.2)",
            },
          },
        },
      },
    },
    Button: {
      variants: {
        solid: {
          bgGradient: "linear(to-r, teal.500, pink.500)",
          rounded: "lg",
          color: "#fff",
          px: 12,
          _hover: {
            bgGradient: "linear(to-r, teal.600, pink.600)",
            transform: "scale(1.02)",
            _disabled: {
              backgroundColor: "rgb(0 0 0 / 95%)",
            },
          },
          _focus: { boxShadow: "0 0 0 1.8px rgba(0, 0, 0, 0.4)" },
        },

        outline: {
          border: "1px solid rgb(0 0 0 / 26%)",
          backgroundColor: "transparent",
          rounded: "0px",
          _focus: { boxShadow: "0 0 0 1.8px rgba(0, 0, 0, 0.4)" },
        },
      },
    },
  },
});
