import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AlertCircle, ArrowLeft, Clock, Tag } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";

// Update mock data
const mockListing = {
  price: 0.5,
  status: "available", // available or sold
  seller: "0x3a872f8FED4421E7d5BE5c98Ab5Ea0e0245169A1",
  duration: 365, // rental duration in days
};

export default function DomainBuy() {
  const router = useRouter();
  const { address: connectedAccount } = useAccount();
  const [isSeller, setIsSeller] = useState(false);
  const { slug: domain } = router.query;

  useEffect(() => {
    setIsSeller(connectedAccount === mockListing.seller);
  }, [connectedAccount]);

  const handleBuy = () => {
    // Handle purchase logic here
    console.log("Purchasing domain");
  };

  const handleCloseRental = () => {
    console.log("Closing rental");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back to Browse
        </Button>

        {/* Domain Info */}
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
            {domain}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {mockListing.status === "available"
              ? "Available for Rent"
              : "Already Rented"}
          </p>
        </div>

        {/* Main info card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {mockListing.status === "sold" ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Domain Already Rented</AlertTitle>
                  <AlertDescription>
                    This domain has already been rented. Please check other
                    available domains.
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
                        {mockListing.price} ETH
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-blue-500" />
                        <span className="text-lg font-medium">Duration</span>
                      </div>
                      <span className="text-2xl font-bold">
                        {mockListing.duration} days
                      </span>
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
                    <Button size="lg" className="w-full" onClick={handleBuy}>
                      Rent Now for {mockListing.price} ETH
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
                  <p className="font-medium">{mockListing.seller}</p>
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
            <p>• Duration: {mockListing.duration} days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
