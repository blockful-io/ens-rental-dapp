import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";
import { labelhash } from "viem";

import { Domain } from "@/src/types";

export default function useDomainData(
  domain: string | undefined
): [Domain | null, boolean, string | null] {
  const [listing, setListing] = useState<Domain | null>(null);
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
              query MyQuery($tokenId: BigInt!) {
                listing(tokenId: $tokenId) {
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
            `,
            variables: {
              tokenId: labelhash(domain.replace(".eth", "")),
            },
          }),
        });

        const responseData = await response.json();
        console.log("Full server response:", responseData);

        if (responseData.errors) {
          throw new Error(`GraphQL Error: ${responseData.errors[0].message}`);
        }

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response data");
        }
        const { data } = responseData as { data: { listing: Domain } };

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
