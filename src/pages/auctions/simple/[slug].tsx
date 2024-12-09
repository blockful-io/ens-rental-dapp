import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AlertCircle, ArrowLeft, Clock, Tag } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useAccount } from "wagmi";
import { formatEther, labelhash, parseEther } from "viem";
import { createWalletClient, custom, publicActions } from "viem";
import { ensRentAddress } from "@/src/wagmi";
import ensRentABI from "@/abis/ensrent.json";
import { config } from "@/src/wagmi";
import useDomainData from "@/src/hooks/useDomainData";

export default function DomainBuy() {
  const router = useRouter();
  const { address: connectedAccount } = useAccount();
  const [isSeller, setIsSeller] = useState(false);
  const { slug: domain } = router.query;
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());

  const [listing, isLoading, error] = useDomainData(domain as string);
  const [duration, setDuration] = useState(
    (new Date(selectedEndDate).getTime() - new Date().getTime()) / 1000 // difference between selected end date and now in seconds
  );

  const isActive = true;

  const pricePerSecond = BigInt(listing?.price || 0);
  console.log("pricePerSecond", pricePerSecond);
  const totalPrice = pricePerSecond * BigInt(duration);

  console.log("pricePerSecond", pricePerSecond);
  console.log("totalPrice", totalPrice);
  console.log("duration", duration);

  useEffect(() => {
    if (listing && connectedAccount) {
      setIsSeller(
        connectedAccount.toLowerCase() === listing.lender.toLowerCase()
      );
    }
  }, [listing, connectedAccount]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(new Date(e.target.value));
    const start = new Date().getTime();
    const end = new Date(e.target.value).getTime();
    const newDuration = Math.floor((end - start) / 1000);
    setDuration(newDuration);
  };

  const handleBuy = async () => {
    if (!listing || !domain || !selectedEndDate) return;

    console.log("pricePerSecond", pricePerSecond);

    try {
      const walletClient = createWalletClient({
        account: connectedAccount,
        transport: custom(window.ethereum),
        chain: config.chains[0],
      }).extend(publicActions);

      const tokenId = BigInt(labelhash((domain as string).replace(".eth", "")));
      const desiredEndTimestamp = BigInt(
        new Date(selectedEndDate).getTime() / 1000
      );

      await walletClient.writeContract({
        address: ensRentAddress,
        abi: ensRentABI,
        functionName: "rentDomain",
        args: [tokenId, desiredEndTimestamp],
        value: totalPrice,
        chain: config.chains[0],
        account: connectedAccount!,
      });

      return;
      // return router.push("/");
    } catch (err) {
      console.error("Error renting domain:", err);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleCloseRental = () => {
    console.log("Closing rental");
    // Implement the logic to close the rental
  };

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

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Listing Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested domain listing could not be found.</p>
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

  // Calculate min and max dates safely
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const rentalEndDate = new Date(Number(listing.rentalEnd) * 1000);
  const maxDate = new Date(Number(listing.maxRentalTime) * 1000);

  return (
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push("/browse")}
        >
          <ArrowLeft className="size-4" />
          Back to Browse
        </Button>

        {/* Domain Info */}
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
            {domain}
          </h1>
          {/* <p className="text-gray-500 dark:text-gray-400">
            {listing.active ? "Available for Rent" : "Not Available"}
          </p> */}
        </div>

        {/* Main info card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {!isActive ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Domain Not Available</AlertTitle>
                  <AlertDescription>
                    This domain is not currently available for rent. Please
                    check other available domains.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Tag className="size-5 text-blue-500" />
                        <span className="text-lg font-medium">Price</span>
                      </div>
                      <span className="text-2xl font-bold">
                        {formatEther(BigInt(totalPrice))} ETH
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-blue-500" />
                        <span className="text-lg font-medium">End Date</span>
                      </div>
                      <input
                        type="date"
                        value={selectedEndDate.toISOString().split("T")[0]}
                        min={minDate}
                        max={maxDate.toISOString().split("T")[0]}
                        onChange={handleDateChange}
                        className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {!isSeller && (
                    <Alert className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      <AlertCircle className="size-4" />
                      <AlertTitle>First Come, First Served</AlertTitle>
                      <AlertDescription>
                        This domain is available for immediate rental. The first
                        person to complete the transaction will receive the
                        domain.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!isSeller ? (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleBuy}
                      disabled={!selectedEndDate}
                    >
                      Rent Now for {formatEther(totalPrice)} ETH
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleCloseRental}
                    >
                      Close rental
                    </Button>
                  )}
                </>
              )}

              {!isSeller && (
                <div className="rounded-lg border p-4">
                  <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Listed by
                  </h2>
                  <p className="font-medium">{listing.lender}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Rental Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              • Rental period starts immediately upon successful transaction
            </p>
            <p>• Price is fixed and non-negotiable</p>
            <p>• Payment is required in ETH</p>
            <p>• Domain transfer will be executed automatically</p>
            {selectedEndDate && (
              <p>
                • Rental ends on:{" "}
                {new Date(selectedEndDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
