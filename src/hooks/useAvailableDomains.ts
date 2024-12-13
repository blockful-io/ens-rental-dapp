import { useState, useEffect } from "react";
import { getEnsRentGraphQL } from "@/src/wagmi";
import { Address, formatEther } from "viem";
import { Domain } from "@/src/types";
import { usePublicClient } from "wagmi";

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

export default function useAvailableDomains(
  lender: Address | undefined
): [AvailableDomain[], boolean, Error | null] {
  const [domains, setDomains] = useState<AvailableDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();
  const ensRentGraphQL = getEnsRentGraphQL(publicClient?.chain.id || 1);

  const oneYearInSeconds = 365 * 24 * 60 * 60;

  useEffect(() => {
    if (!lender) return;

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
              query GetListings($lender: String!) {
                listings(where: {lender_not: $lender}) {
                  items {
                    rentals {
                      items {
                        endTime
                        borrower
                      }
                    }
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
            variables: {
              lender,
            },
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (responseData.errors) {
          throw new Error(`GraphQL Error: ${responseData.errors[0].message}`);
        }

        const { data } = responseData;

        if (data?.listings?.items) {
          const availableDomains = data.listings.items.map(
            (listing: Domain) => {
              // Convert price per second to ETH and multiply by seconds in a year
              const pricePerYear =
                BigInt(listing.price || 0) * BigInt(oneYearInSeconds);
              const priceInEth = formatEther(pricePerYear);

              return {
                id: listing.id,
                maxRentalTime: listing.maxRentalTime,
                createdAt: listing.createdAt,
                isWrapped: listing.isWrapped,
                lender: listing.lender,
                node: listing.node,
                name: `${listing.name}.eth`,
                price: priceInEth,
                tokenId: listing.tokenId,
                rentals: listing.rentals,
              };
            }
          );

          const filteredDomains = availableDomains.filter((domain: any) => {
            const lastRentEndTime = domain?.rentals?.items[0]?.endTime;
            return !lastRentEndTime || lastRentEndTime < Date.now() / 1000;
          });

          setDomains(filteredDomains);
        }
      } catch (err) {
        setError(new Error("An error occurred fetching available domains"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableDomains();
  }, [lender]);

  return [domains, isLoading, error];
}
