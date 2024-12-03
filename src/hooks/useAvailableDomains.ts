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
    const fetchAvailableDomains = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(ensRentGraphQL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                listings(where: { active: true }) {
                  id
                  name
                  price
                  maxEndTimestamp
                }
              }
            `,
          }),
        });

        const { data } = await response.json();

        if (data && data.listings) {
          const availableDomains = data.listings.map((listing: any) => ({
            id: listing.id,
            name: listing.name,
            rentPrice: listing.price,
            expiryDate: listing.maxEndTimestamp,
          }));
          setDomains(availableDomains);
        }
      } catch (err) {
        setError(new Error("An error occurred fetching available domains"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableDomains();
  }, []);

  return [domains, isLoading, error];
}
