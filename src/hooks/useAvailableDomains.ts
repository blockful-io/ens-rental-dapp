import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";
import { formatEther } from "viem";

interface AvailableDomain {
  id: string;
  maxRentalTime: string;
  createdAt: string;
  available: boolean;
  isWrapped: boolean;
  lender: string;
  node: string;
  name: string;
  price: string;
  tokenId: string;
}

export default function useAvailableDomains(): [
  AvailableDomain[],
  boolean,
  Error | null
] {
  const [domains, setDomains] = useState<AvailableDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const oneDayInSeconds = 24 * 60 * 60;
  const oneYearInSeconds = 365 * 24 * 60 * 60;

  useEffect(() => {
    const fetchAvailableDomains = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(ensRentGraphQL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              {
                listings(where: {available: true}) {
                  items {
                    available
                    createdAt
                    id
                    isWrapped
                    lender
                    maxRentalTime
                    name
                    node
                    price
                    tokenId
                  }
                }
              }
            `,
          }),
        });

        const responseData = await response.json();
        console.log("GraphQL Response:", responseData);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (responseData.errors) {
          throw new Error(`GraphQL Error: ${responseData.errors[0].message}`);
        }

        const { data } = responseData;

        if (data?.listings?.items) {
          const availableDomains = data.listings.items
            // .filter((listing: any) => listing.active)
            .map((listing: any, index: number) => {
              // Convert price per second to ETH and multiply by seconds in a year
              const pricePerYear =
                BigInt(listing.price) * BigInt(oneYearInSeconds);
              const priceInEth = formatEther(pricePerYear);

              return {
                id: listing.id,
                maxRentalTime: listing.maxRentalTime,
                createdAt: listing.createdAt,
                available: listing.available,
                isWrapped: listing.isWrapped,
                lender: listing.lender,
                node: listing.node,
                name: `${listing.name}.eth`,
                price: priceInEth,
                tokenId: listing.tokenId,
              };
            });
          setDomains(availableDomains);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(new Error("An error occurred fetching available domains"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableDomains();
  }, []);

  return [domains, isLoading, error];
}
