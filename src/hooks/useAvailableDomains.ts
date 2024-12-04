import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";
import { formatEther } from "viem";

interface AvailableDomain {
  id: string;
  name: string;
  rentPrice: string;
  expiryDate: string;
}

export default function useAvailableDomains(): [
  AvailableDomain[],
  boolean,
  Error | null
] {
  const [domains, setDomains] = useState<AvailableDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
                listings {
                  items {
                    name
                    price
                    isWrapped
                    createdAt
                    lender
                    id
                    rentalEnd
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
          console.log("data.listings.items", data.listings.items);
          const availableDomains = data.listings.items
            // .filter((listing: any) => listing.active)
            .map((listing: any, index: number) => ({
              id: listing.id,
              name: `${listing.name}.eth`,
              rentPrice: listing.price,
              expiryDate: listing.rentalEnd,
            }));
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
