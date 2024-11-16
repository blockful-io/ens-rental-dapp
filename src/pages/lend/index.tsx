import { useEffect, useState } from "react";
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
import { getNamesForAddress } from "@ensdomains/ensjs/subgraph";
import { toast } from "sonner";
import { useAccount, usePublicClient } from "wagmi";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { PublicClient } from "viem";

export default function Component() {
  const router = useRouter();
  const [domain, setDomain] = useState(router.query.domain as string);
  const [startingPrice, setStartingPrice] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const { address } = useAccount();
  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  useEffect(() => {
    const getNames = async () => {
      setIsLoading(true);
      try {
        if (!address) return;

        const result = await getNamesForAddress(publicClient, {
          address: address,
        });
        setNames(result.map((object) => object.name!));

        if (domain && !names.find((name) => name === domain)) {
          setError("Domain not available");
        }
      } catch (error) {
        toast.error("An error occurred fetching domains");
      } finally {
        setIsLoading(false);
      }
    };

    getNames();
  }, [address, publicClient, domain]);

  const startAuction = (node: string) => {
    // TODO: lock domain on rental contract
    return router.push(`/auctions/simple/${node}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
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
              onClick={() => startAuction(domain)}
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
