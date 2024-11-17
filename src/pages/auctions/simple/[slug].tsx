import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AlertCircle, ArrowLeft, Clock, Tag } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccount } from "wagmi";
import { ensRentGraphQL } from "@/src/wagmi";
import { formatEther, labelhash, parseEther } from "viem";
import { createWalletClient, custom, publicActions } from "viem";
import { ensRentAddress } from "@/src/wagmi";
import ensRentABI from "@/abis/ensrent.json";
import { config } from "@/src/wagmi";

export default function DomainBuy() {
  const router = useRouter();
  const { address: connectedAccount } = useAccount();
  const [isSeller, setIsSeller] = useState(false);
  const { slug: domain } = router.query;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!domain) return;
      try {
        const response = await fetch(ensRentGraphQL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetListing($id: ID!) {
                listing(id: $id) {
                  id
                  price
                  lender
                  active
                }
              }
              `,
            variables: {
              id: BigInt(
                labelhash((domain as string).replace(".eth", ""))
              ).toString(),
            },
          }),
        });

        const { data } = await response.json();

        if (data.listing) {
          setListing(data.listing);
          setIsSeller(
            connectedAccount?.toLowerCase() ===
              data.listing.lender.toLowerCase()
          );
        } else {
          setError("Listing not found");
        }
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Error fetching listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [domain, connectedAccount]);

  useEffect(() => {
    // setIsSeller(connectedAccount === mockListing.seller);
  }, [connectedAccount]);

  const handleBuy = async () => {
    if (!listing || !domain) return;

    debugger;

    try {
      const walletClient = createWalletClient({
        account: connectedAccount,
        transport: custom(window.ethereum),
        chain: config.chains[0],
      }).extend(publicActions);

      const tokenId = BigInt(labelhash((domain as string).replace(".eth", "")));
      const desiredEndTimestamp = BigInt(Math.floor(Date.now() / 1000) + 900); // current timestamp plus 1h

      const { request } = await walletClient.simulateContract({
        address: ensRentAddress,
        abi: ensRentABI,
        functionName: "rentDomain",
        args: [tokenId, desiredEndTimestamp],
        value: parseEther("0.001", "wei"),
        account: connectedAccount,
      });

      await walletClient.writeContract(request);
      return router.push("/");
    } catch (err) {
      console.error("Error renting domain:", err);
      setError("Failed to rent domain. Please try again.");
    }
  };

  const handleCloseRental = () => {
    console.log("Closing rental");
  };

  if (loading) {
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
            {listing.status === "available"
              ? "Available for Rent"
              : "Already Rented"}
          </p>
        </div>

        {/* Main info card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {listing.status === "sold" ? (
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
                        {formatEther(listing.price)} ETH
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-blue-500" />
                        <span className="text-lg font-medium">Duration</span>
                      </div>
                      <span className="text-2xl font-bold">
                        {listing.duration} days
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
                      Rent Now for {formatEther(listing.price)} ETH
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
                  <p className="font-medium">{listing.seller}</p>
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
            <p>• Duration: {listing.duration} days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
