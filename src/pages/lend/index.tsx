import { useState } from "react";
import { Button } from "@/components/ui/button";
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

// Mock data for rented domains
const rentedDomains = [
  {
    id: 1,
    domain: "crypto.eth",
    renter: "0x1234...5678",
    price: 0.5,
    startDate: "2024-03-15",
    duration: 2592000, // 30 days in seconds
    remainingTime: 1728000, // 20 days in seconds
  },
  {
    id: 2,
    domain: "nft.eth",
    renter: "0x8765...4321",
    price: 0.8,
    startDate: "2024-03-10",
    duration: 5184000, // 60 days in seconds
    remainingTime: 3456000, // 40 days in seconds
  },
  {
    id: 3,
    domain: "defi.eth",
    renter: "0x2468...1357",
    price: 1.2,
    startDate: "2024-03-01",
    duration: 7776000, // 90 days in seconds
    remainingTime: 4320000, // 50 days in seconds
  },
];

export default function Component() {
  const router = useRouter();
  const [domain, setDomain] = useState(router.query.domain as string);
  const [floorPrice, setfloorPrice] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [rentalEnabled, setRentalEnabled] = useState(false);

  const startAuction = (node: string) => {
    // TODO: lock domain on rental contract
    return router.push(`/auctions/simple/${node}`);
  };

  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center py-10">
      <div className="space-y-12 w-full">
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
                <Input
                  id="domain"
                  placeholder="example.eth"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={rentalEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floorPrice">Floor Price (ETH)</Label>
                <Input
                  id="floorPrice"
                  type="number"
                  value={floorPrice ?? ""}
                  placeholder="0.01"
                  onChange={(e) => setfloorPrice(Number(e.target.value))}
                  disabled={rentalEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Rental Duration</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const start = new Date().getTime();
                    const end = new Date(e.target.value).getTime();
                    setDuration(Math.floor((end - start) / 1000));
                  }}
                  disabled={rentalEnabled}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-4">
            <Button
              onClick={() => startAuction(domain)}
              disabled={!domain || !floorPrice || duration <= 0}
            >
              Enable Rental
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
