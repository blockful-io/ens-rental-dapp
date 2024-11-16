import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  User,
  Wallet,
  Timer,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/router";
import { usePublicClient, useAccount } from "wagmi";
import { shortenAddress } from "@/src/utils";

// Mock data for a rented domain
const rentedDomain = {
  id: 1,
  renter: "0x3a872f8FED4421E7d5BE5c98Ab5Ea0e0245169A0",
  owner: "0x3a872f8FED4421E7d5BE5c98Ab5Ea0e0245169A1",
  rentPrice: 0.5,
  startDate: "2024-03-15T10:30:00",
  endDate: "2024-04-15T10:30:00",
  transactionHash: "0xabc...xyz",
  renewalPrice: 0.55,
  status: "active", // active, expired, pending
  history: [
    {
      date: "2024-03-15T10:30:00",
      event: "Rental Started",
      price: 0.5,
      from: "0x1234...5678",
    },
    {
      date: "2024-03-15T10:29:00",
      event: "Rental Payment",
      price: 0.5,
      from: "0x1234...5678",
    },
    {
      date: "2024-03-15T10:28:00",
      event: "Rental Listed",
      price: 0.5,
      from: "0x3a872f8FED4421E7d5BE5c98Ab5Ea0e0245169A0",
    },
  ],
};

export default function RentedDomainDetails() {
  const router = useRouter();
  const client = usePublicClient();
  const { slug: domain } = router.query;
  const { address } = useAccount();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRemainingTime = () => {
    const now = new Date();
    const end = new Date(rentedDomain.endDate);
    const diff = end.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  const isRenter = address?.toLowerCase() === rentedDomain.renter.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8 max-w-4xl space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Domains
        </Button>

        {/* Main Details Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{domain}</CardTitle>
                <CardDescription>Rental Details</CardDescription>
              </div>
              <div
                className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                {rentedDomain.status.charAt(0).toUpperCase() +
                  rentedDomain.status.slice(1)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <Wallet className="w-4 h-4" />
                    <span>Rental Price</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {rentedDomain.rentPrice} ETH
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <Timer className="w-4 h-4" />
                    <span>Time Remaining</span>
                  </div>
                  <div className="text-2xl font-bold">{getRemainingTime()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Rental Period</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      Start: {formatDate(rentedDomain.startDate)}
                    </div>
                    <div className="text-sm">
                      End: {formatDate(rentedDomain.endDate)}
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Parties</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      Owner: {shortenAddress(rentedDomain.owner)}
                    </div>
                    <div className="text-sm">
                      Renter: {shortenAddress(rentedDomain.renter)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h3 className="text-lg font-medium mb-4">Transaction History</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentedDomain.history.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(event.date)}</TableCell>
                        <TableCell>{event.event}</TableCell>
                        <TableCell>{shortenAddress(event.from)}</TableCell>
                        <TableCell>{event.price} ETH</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                window.open(
                  `${client!.chain!.blockExplorers!.default.url}/tx/${
                    rentedDomain.transactionHash
                  }`,
                  "_blank"
                );
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View on Etherscan
            </Button>

            {isRenter && (
              <Button
                variant="destructive"
                onClick={() => {
                  // TODO: Implement cancel rental logic
                  console.log("Cancel rental clicked");
                }}
              >
                Cancel Rental
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
