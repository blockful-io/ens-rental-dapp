"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import {
  createWalletClient,
  custom,
  labelhash,
  namehash,
  parseEther,
  publicActions,
  formatEther,
} from "viem";

import { config } from "@/src/wagmi";

import {
  ensRentAddress,
  baseRegistrarAddress,
  nameWrapperAddress,
} from "@/src/wagmi";
import useDomainsByAddress from "@/src/hooks/useDomains";
import ensRentABI from "@/abis/ensrent.json";
import baseRegistrarABI from "@/abis/baseRegistrar.json";
import nameWrapperABI from "@/abis/nameWrapper.json";

export const ONE_YEAR_IN_SECONDS = 31536000;

export default function Component() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [price, setPrice] = useState<string>();
  const [duration, setDuration] = useState(0);
  const { address } = useAccount();
  const [walletClient, setWalletClient] = useState<any>(null);
  const [checkYourWallet, setCheckYourWallet] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const [isListing, setIsListing] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  const pricePerSecond = price
    ? parseEther(price) / BigInt(ONE_YEAR_IN_SECONDS)
    : BigInt(0);

  useEffect(() => {
    if (typeof window !== "undefined" && address) {
      const client = createWalletClient({
        account: address,
        transport: custom(window.ethereum),
        chain: config.chains[0],
      }).extend(publicActions);
      setWalletClient(client);
    }
  }, [address]);

  useEffect(() => {
    if (router.query.domain) {
      setDomain(router.query.domain as string);
    }
  }, [router.query]);

  const [names, isLoading, error] = useDomainsByAddress(address);

  const checkApproval = async (domainToCheck: string) => {
    if (!walletClient) return false;

    setIsCheckingApproval(true);
    try {
      const name = domainToCheck.split(".")[0];
      const tokenId = BigInt(labelhash(name)).toString();

      let owner = (await walletClient.readContract({
        address: baseRegistrarAddress,
        abi: baseRegistrarABI,
        functionName: "ownerOf",
        args: [tokenId],
      })) as `0x${string}`;

      if (owner !== nameWrapperAddress) owner = baseRegistrarAddress;

      const approvedForAll = (await walletClient.readContract({
        address: owner,
        abi: nameWrapperABI,
        functionName: "isApprovedForAll",
        args: [address, ensRentAddress],
      })) as boolean;

      setIsApproved(approvedForAll);
      return approvedForAll;
    } catch (error) {
      console.error({ error });
      return false;
    } finally {
      setIsCheckingApproval(false);
    }
  };

  useEffect(() => {
    if (domain) checkApproval(domain);
  }, [domain]);

  const approveDomain = async (domainToApprove: string) => {
    if (!walletClient) return;

    setIsApproving(true);
    try {
      const name = domainToApprove.split(".")[0];
      const tokenId = BigInt(labelhash(name));

      let owner = (await walletClient.readContract({
        address: baseRegistrarAddress,
        abi: baseRegistrarABI,
        functionName: "ownerOf",
        args: [tokenId],
      })) as `0x${string}`;

      if (owner !== nameWrapperAddress) owner = baseRegistrarAddress;

      setCheckYourWallet(true);
      const { request } = await walletClient.simulateContract({
        address: owner,
        abi: nameWrapperABI,
        functionName: "setApprovalForAll",
        args: [ensRentAddress, true],
        account: address,
      });

      setCheckYourWallet(false);

      await walletClient.waitForTransactionReceipt({
        hash: await walletClient.writeContract(request),
      });

      setIsApproved(true);
    } catch (error) {
      console.error({ error });
    } finally {
      setIsApproving(false);
    }
  };

  const listDomain = async (domainToList: string) => {
    if (!price || !duration || !walletClient) {
      return;
    }

    setIsListing(true);
    try {
      const node = namehash(domainToList);
      const name = domainToList.split(".")[0];
      const tokenId = BigInt(labelhash(name));

      const pricePerSecond = parseEther(price) / BigInt(ONE_YEAR_IN_SECONDS);
      const maxEndTimestamp = BigInt(Math.floor(Date.now() / 1000) + duration);

      setCheckYourWallet(true);
      const { request } = await walletClient.simulateContract({
        address: ensRentAddress,
        abi: ensRentABI,
        functionName: "listDomain",
        args: [tokenId, pricePerSecond, maxEndTimestamp, node, name],
        account: address,
      });

      const hash = await walletClient.writeContract(request);
      setCheckYourWallet(false);

      await walletClient.waitForTransactionReceipt({ hash });
      router.push(`/auctions/simple/${domainToList}`);
    } catch (error) {
      console.error({ error });
    } finally {
      setCheckYourWallet(false);
      setIsListing(false);
    }
  };

  if (typeof window === "undefined") {
    return null;
  }

  if (!address) {
    router.push("/");
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} variant="outline">
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8 max-w-4xl">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>ENS Domain Rental</CardTitle>
            <CardDescription>Rent an ENS domain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {names.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {domain && (
                  <p className="text-sm text-gray-500 mt-1">
                    {isCheckingApproval ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white mr-2"></div>
                        Checking approval status...
                      </span>
                    ) : isApproved ? (
                      "✅ This domain is already approved for rental"
                    ) : (
                      "📝 This domain needs approval before it can be listed"
                    )}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Price per Year (ETH)</Label>
                <Input
                  id="startingPrice"
                  type="text"
                  value={price}
                  placeholder="0.01"
                  onChange={(e) => {
                    if (
                      !e.target.value ||
                      /^\d*(\.\d{0,18})?$/.test(e.target.value)
                    ) {
                      setPrice(e.target.value);
                    }
                  }}
                />
                {!!price && (
                  <p className="text-sm text-gray-500 mt-1">
                    Price per second: {formatEther(pricePerSecond)} ETH
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Max rental end date</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const start = new Date().getTime();
                    const end = new Date(e.target.value).getTime();
                    setDuration(Math.floor((end - start) / 1000));
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Note: It must be before the domain's expiry date
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-4">
            {!domain ? (
              <Button disabled={true}>Select a domain</Button>
            ) : isCheckingApproval ? (
              <Button disabled>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking approval...
              </Button>
            ) : !isApproved ? (
              <Button
                onClick={async () => {
                  await approveDomain(domain);
                }}
                disabled={!domain || isApproving}
              >
                {isApproving ? "Approving..." : "Approve Domain for Rental"}
              </Button>
            ) : (
              <Button
                onClick={async () => await listDomain(domain)}
                disabled={!domain || !price || duration <= 0 || isListing}
              >
                {checkYourWallet
                  ? "Check your wallet"
                  : isListing
                  ? "Listing Domain..."
                  : "List Domain for Rent"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
