import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import {
  createWalletClient,
  custom,
  labelhash,
  namehash,
  parseEther,
  publicActions,
} from "viem";

import { config } from "@/src/wagmi";

import {
  ensRentAddress,
  baseRegistrarAddress,
  nameWrapperAddress,
} from "@/src/wagmi";
import useDomainsByAddress from "@/hooks/useDomains";
import ensRentABI from "@/abis/ensrent.json";
import baseRegistrarABI from "@/abis/baseRegistrar.json";
import nameWrapperABI from "@/abis/nameWrapper.json";
export default function Component() {
  const router = useRouter();
  const [domain, setDomain] = useState(router.query.domain as string);
  const [startingPrice, setStartingPrice] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const { address } = useAccount();
  const walletClient = createWalletClient({
    account: address,
    transport: custom(window.ethereum),
    chain: config.chains[0],
  }).extend(publicActions);

  if (!address) {
    return router.push("/");
  }

  const [names, isLoading, error] = useDomainsByAddress(address);

  const listDomain = async (domain: string) => {
    if (!startingPrice || !duration) {
      return;
    }

    const node = namehash(domain);
    const name = domain.split(".")[0];
    const tokenId = BigInt(labelhash(name));

    let owner = (await walletClient.readContract({
      address: baseRegistrarAddress,
      abi: baseRegistrarABI,
      functionName: "ownerOf",
      args: [tokenId],
    })) as `0x${string}`;

    debugger;
    if (owner !== nameWrapperAddress) owner = baseRegistrarAddress;

    const approvedForAll = (await walletClient.readContract({
      address: owner,
      abi: nameWrapperABI,
      functionName: "isApprovedForAll",
      args: [address, ensRentAddress],
    })) as boolean;

    if (!approvedForAll) {
      const { request } = await walletClient.simulateContract({
        address: owner,
        abi: nameWrapperABI,
        functionName: "setApprovalForAll",
        args: [ensRentAddress, true],
        account: address,
      });
      await walletClient.writeContract(request);
      await walletClient.waitForTransactionReceipt({
        hash: await walletClient.writeContract(request),
      });
    }

    try {
      const pricePerSecond =
        parseEther(startingPrice.toString()) / BigInt(duration);
      const maxEndTimestamp = BigInt(Math.floor(Date.now() / 1000) + duration);

      const { request } = await walletClient.simulateContract({
        address: ensRentAddress,
        abi: ensRentABI,
        functionName: "listDomain",
        args: [tokenId, pricePerSecond, maxEndTimestamp, node, name],
        account: address,
      });
      await walletClient.writeContract(request);
      return router.push(`/auctions/simple/${domain}`);
    } catch (error) {
      console.error({ error });
    }
  };

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
            <CardDescription>
              Rent an ENS domain through a Dutch auction
            </CardDescription>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price (ETH)</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  value={startingPrice ?? ""}
                  placeholder="0.01"
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Rental Maximum Duration</Label>
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
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-4">
            <Button
              onClick={async () => await listDomain(domain)}
              disabled={!domain || !startingPrice || duration <= 0}
            >
              Enable Rental
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
