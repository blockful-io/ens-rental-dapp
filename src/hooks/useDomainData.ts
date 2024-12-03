import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";
import { labelhash } from "viem";

interface DomainListing {
  id: string;
  price: string;
  lender: string;
  active: boolean;
}

export default function useDomainData(
  domain: string | undefined
): [DomainListing | null, boolean, string | null] {
  const [listing, setListing] = useState<DomainListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!domain) return;

      setIsLoading(true);

      // Simulating API call delay
      setTimeout(() => {
        const mockedListing: DomainListing = {
          id: "1",
          price: "0.1",
          lender: "0x1234567890123456789012345678901234567890",
          active: true,
        };

        setListing(mockedListing);
        setIsLoading(false);
      }, 1000); // Simulate 1 second delay
    };

    fetchListing();

    // Commented out real implementation for future use
    /*
    const fetchListing = async () => {
      if (!domain) return;

      setIsLoading(true);

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
              id: BigInt(labelhash(domain.replace(".eth", ""))).toString(),
            },
          }),
        });

        const { data } = await response.json();

        if (data.listing) {
          setListing(data.listing);
        } else {
          setError("Listing not found");
        }
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Error fetching listing details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
    */
  }, [domain]);

  return [listing, isLoading, error];
}
