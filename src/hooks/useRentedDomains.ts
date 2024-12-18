import { useState, useEffect } from "react";
import { getEnsRentGraphQL } from "@/src/wagmi";
import { Address } from "viem";
import { usePublicClient } from "wagmi";

export type RentedDomainType = {
  borrower: string;
  endTime: string;
  startTime: string;
  listing: {
    createdAt: string;
    id: string;
    isWrapped: boolean;
    lender: string;
    maxRentalTime: string;
    name: string;
    node: string;
    price: string;
    tokenId: string;
  };
};

export default function useRentedDomains(
  lender: Address | undefined
): [RentedDomainType[], boolean, Error | null] {
  const [domains, setDomains] = useState<RentedDomainType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();
  const ensRentGraphQL = getEnsRentGraphQL(publicClient?.chain.id || 1);

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
              query GetListings {
                rentals(orderBy: "startTime") {
                  items {
                    borrower
                    endTime
                    startTime
                    listing {
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
              }
            `,
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

        if (data?.rentals) {
          const rentedDomains = data.rentals.items;

          const filteredDomains = rentedDomains.filter((domain: any) => {
            return domain.endTime && Number(domain.endTime) > Date.now() / 1000;
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
