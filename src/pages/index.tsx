import React, { useEffect, useState } from "react";
import * as ethers from "ethers";
import contractInfo from "abi/SwipePayment.json";
import erc20ContractInfo from "abi/ERC20.json";
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
  useToast,
  Link,
} from "@chakra-ui/react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { injected, switchNetwork, TOKENS } from "libs/wallet";
import { useMutation } from "react-query";

function usePayment() {
  const { library, account } = useWeb3React();
  const toast = useToast();

  return useMutation(
    async (currency: string) => {
      const sellerAddress = "0x67009eec57b6BADBFECf4578b8029cB212cdc70b";
      const amount = "50";
      const token = TOKENS.find((t) => t.symbol === currency);

      let provider = library.getSigner(account).connectUnchecked();
      const paymentContract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
      const tokenContract = new ethers.Contract(token?.address || "", erc20ContractInfo.abi, provider);

      const approveTx = await tokenContract.approve(paymentContract.address, ethers.utils.parseUnits(amount, token?.decimals || 18));
      await approveTx.wait();

      // make payment
      const tx = await paymentContract.receivePayment(
        tokenContract.address,
        sellerAddress,
        ethers.utils.parseUnits(amount, token?.decimals || 18)
      );
      console.log({ tx });
      await tx.wait();

      const txHash = tx.hash;

      // send transaction to backend
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionHash: txHash }),
      });
      let payload = await response.json();

      console.log({ payload });
      return payload;
    },
    {
      onSuccess: () => {
        toast({
          title: "Purchase successful 🎉",
          description: "We've sent you funds to the seller",
          position: "bottom-right",
          status: "error",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Error making payment",
          description: err.message,
          position: "bottom-right",
          status: "error",
        });
      },
    }
  );
}

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { active, activate, account } = useWeb3React();
  const [selectedToken, setSelectedToken] = useState("USDT");
  const paymentMutation = usePayment();

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
              {paymentMutation.isSuccess ? (
                <>
                  <Text fontWeight="600">Item successful purchased</Text>
                  <Text fontSize="sm">
                    1: Your payment transaction{" "}
                    <Link href={`https://rinkeby.etherscan.io/tx/${paymentMutation.data?.transactionHash}`}>
                      {paymentMutation.data?.transactionHash}
                    </Link>
                  </Text>
                  <Text fontSize="sm">
                    2: Seller payout transaction{" "}
                    <Link href={`https://rinkeby.etherscan.io/tx/${paymentMutation.data?.payoutHash}`}>
                      {paymentMutation.data?.payoutHash}
                    </Link>
                  </Text>
                </>
              ) : (
                <>
                  <Text fontWeight="600">Purchasing this item would require 2 steps</Text>
                  <Text fontSize="sm">1: A transaction to approve transfer money from your account</Text>
                  <Text fontSize="sm">2: A transaction to make the payment to the seller</Text>
                </>
              )}
            </Stack>

            {active ? (
              <Button onClick={onOpen} isLoading={paymentMutation.isLoading} w="full" transform="scale(1.05)" size="lg" fontSize="md">
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

              <Select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} placeholder="Select payment token">
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="DAI">DAI</option>
              </Select>

              <Button
                size="lg"
                isLoading={paymentMutation.isLoading}
                onClick={() => {
                  paymentMutation.mutate(selectedToken);
                  onClose();
                }}
              >
                Pay with {selectedToken}
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
};

export default Home;
