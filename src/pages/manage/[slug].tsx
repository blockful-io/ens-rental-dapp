import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  User,
  Wallet,
  Timer,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/router";
import { usePublicClient, useAccount } from "wagmi";
import { formatEther } from "viem";

import useDomainData from "@/src/hooks/useDomainData";

export default function RentedDomainDetails() {
  const router = useRouter();
  const client = usePublicClient();
  const { slug: domain } = router.query;

  const [rental, isLoading] = useDomainData(domain as string);

  if (isLoading || !rental) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="mx-auto size-12 animate-spin text-blue-500 dark:text-blue-400" />
          <h2 className="mt-4 text-xl font-semibold dark:text-white">
            Loading...
          </h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-gray-300">
            Please wait while we prepare your content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8 max-w-4xl space-y-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
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
                {rental.status}
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
                    {rental.price
                      ? `${formatEther(BigInt(rental.price))} ETH`
                      : "-"}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <Timer className="w-4 h-4" />
                    <span>Time Remaining</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {rental.maxRentalTime
                      ? getRemainingTime(rental.maxRentalTime)
                      : "-"}
                  </div>
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
                      <span className="text-gray-500 dark:text-gray-400 mr-1">
                        Start:
                      </span>
                      {rental.rentals?.length
                        ? formatDate(rental.rentals[0].startTime)
                        : "-"}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 mr-1">
                        End:
                      </span>
                      {rental.rentals?.length
                        ? formatDate(rental.rentals[0].endTime)
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Parties</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <span className="gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Owner:
                      </span>
                      <span className="text-sm">{rental.lender}</span>
                    </div>
                    {rental.hasActiveRental && (
                      <div className="flex flex-col">
                        <span className="gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Renter:
                        </span>
                        <span className="text-sm">
                          {rental.hasActiveRental
                            ? rental.rentals![0].borrower
                            : "-"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            {/* <div>
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
                    {rental.rentals?.map((rental, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(rental.startTime)}</TableCell>
                        <TableCell>Domain listed</TableCell>
                        <TableCell>{shortenAddress(rental.borrower)}</TableCell>
                        <TableCell>
                          {formatEther(BigInt(rental.price))} ETH
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>  */}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                window.open(
                  `${client!.chain!.blockExplorers!.default.url}/tx/${
                    rental.id
                  }`,
                  "_blank"
                );
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View on Etherscan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

const formatDate = (date: number): string => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRemainingTime = (endDate: string) => {
  console.log({ endDate });

  const now = new Date();
  const end = new Date(parseInt(endDate) * 1000);
  const diff = end.getTime() - now.getTime();

  // Return early if already expired
  if (diff <= 0) {
    return "Expired";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};
