import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";
import { labelhash } from "viem";

interface DomainListing {
  id: string;
  price: string;
  lender: string;
  rentalEnd: string;
  name: string;
  isWrapped: boolean;
  createdAt: string;
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

      try {
        const response = await fetch(ensRentGraphQL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetListing($tokenId: BigInt!) {
                listing(tokenId: $tokenId) {
                  name
                  price
                  rentalEnd
                  isWrapped
                  createdAt
                  lender
                }
              }
            `,
            variables: {
              tokenId: BigInt(labelhash(domain.replace(".eth", ""))).toString(),
            },
          }),
        });

        const { data } = await response.json();

        console.log("GraphQL Response:", data);

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
  }, [domain]);

  return [listing, isLoading, error];
}
