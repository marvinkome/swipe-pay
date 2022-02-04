import React, { useEffect } from "react";
import {
  Button,
  chakra,
  Container,
  Heading,
  Stack,
  Image,
  Text,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { injected, switchNetwork } from "libs/wallet";

function usePayment() {
  //
}

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { active, activate, account } = useWeb3React();

  useEffect(() => {
    const fn = async () => {
      const isConnected = await injected.isAuthorized();
      if (!isConnected) return;

      try {
        activate(injected, undefined, true);
      } catch (error) {
        if (error instanceof UnsupportedChainIdError) {
          await switchNetwork();
          await activate(injected, undefined, true);
        }
      }
    };
    fn();
  }, [activate]);

  const onActivate = async () => {
    try {
      activate(injected, undefined, true);
    } catch (error) {
      if (error instanceof UnsupportedChainIdError) {
        await switchNetwork();
        await activate(injected, undefined, true);
      }
    }
  };

  const onBuyNow = async () => {
    // make payment
    // send transaction to backend
    // backend will confirm payment and payout to seller
  };

  return (
    <main>
      <Container mt={1} mb={5}>
        <Stack spacing={6}>
          <Stack spacing={3} textAlign="center" px={16} py={5}>
            <Heading>Swipe ⚡️</Heading>
            <Text>A simple application to test payments in crypto</Text>
            {account && (
              <Text>Connected Address: {`${account.substring(0, 6)}...${account.substring(account.length - 4, account.length)}`}</Text>
            )}
          </Stack>

          <Stack alignItems="center" spacing={10}>
            <Image
              _hover={{ transform: "scale(1.05)" }}
              transition="all 0.2s"
              boxSize="80%"
              src="/product-image.png"
              alt="Product Image"
              rounded="lg"
              boxShadow="dark-lg"
            />

            <Stack w="80%" direction="row" justify="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                A Random shoe
              </Text>
              <Text fontSize="4xl" fontWeight="bold">
                $50
              </Text>
            </Stack>

            <Stack>
              <Text fontWeight="600">Purchasing this item would require 2 steps</Text>
              <Text fontSize="sm">1: A transaction to approve transfer money from your account</Text>
              <Text fontSize="sm">2: A transaction to make the payment to the seller</Text>
            </Stack>

            {active ? (
              <Button onClick={onOpen} w="full" transform="scale(1.05)" size="lg" fontSize="md">
                Buy Now
              </Button>
            ) : (
              <Button onClick={onActivate} w="full" transform="scale(1.05)" size="lg" fontSize="md">
                Connect Account
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={8} mb={6}>
              <chakra.div pos="relative" overflow="hidden" rounded="lg" boxShadow="dark-lg">
                <Image boxSize="100%" src="/product-image.png" alt="Product Image" />
                <chakra.div bottom="0" pos="absolute" bgGradient="linear(to-b, whiteAlpha.50, gray.900)" w="full" px={5} py={3}>
                  <Text fontWeight="bold" fontSize="2xl">
                    $50.00
                  </Text>
                </chakra.div>
              </chakra.div>

              <Select placeholder="Select payment token">
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="DAI">DAI</option>
              </Select>

              <Button>Pay</Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
};

export default Home;
