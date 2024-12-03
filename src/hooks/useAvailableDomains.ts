import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";

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
    const fetchMockedDomains = () => {
      // Simulating API call delay
      setTimeout(() => {
        const mockedDomains: AvailableDomain[] = [
          {
            id: "1",
            name: "example.eth",
            rentPrice: "0.1",
            expiryDate: (Date.now() + 86400000).toString(), // 24 hours from now
          },
          {
            id: "2",
            name: "test.eth",
            rentPrice: "0.05",
            expiryDate: (Date.now() + 172800000).toString(), // 48 hours from now
          },
          {
            id: "3",
            name: "blockchain.eth",
            rentPrice: "0.2",
            expiryDate: (Date.now() + 259200000).toString(), // 72 hours from now
          },
          {
            id: "4",
            name: "defi.eth",
            rentPrice: "0.15",
            expiryDate: (Date.now() + 345600000).toString(), // 96 hours from now
          },
          {
            id: "5",
            name: "nft.eth",
            rentPrice: "0.25",
            expiryDate: (Date.now() + 432000000).toString(), // 120 hours from now
          },
        ];

        setDomains(mockedDomains);
        setIsLoading(false);
      }, 1000); // Simulate 1 second delay
    };

    fetchMockedDomains();

    // Commented out real implementation for future use
    /*
    const fetchAvailableDomains = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_ENS_RENT_GRAPHQL_URL!,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              {
                listings {
                  id
                  price
                  lender
                  active
                  blockNumber
                  name
                }
              }
            `,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();

        if (data && data.listings) {
          const availableDomains = data.listings
            .filter((listing: any) => listing.active)
            .map((listing: any, index: number) => ({
              id: listing.id,
              name: `${listing.name}.eth`,
              rentPrice: formatEther(listing.price),
              expiryDate: (Date.now() + 3600000).toString(), // Default 1 hour expiry for now
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
    */
  }, []);

  return [domains, isLoading, error];
}
