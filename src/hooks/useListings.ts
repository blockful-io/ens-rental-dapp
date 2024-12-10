import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";

import { Domain, RentalStatus } from "@/src/types";

export default function useListings({ lender }: { lender: string }): [Domain[], boolean] {
  const [listings, setListings] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);

      const response = await fetch(ensRentGraphQL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
              query MyQuery($lender: String!) {
                listings(where: {lender: $lender}) {
                  items {
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
            lender
          },
        }),
      });

      const responseData = await response.json();
      console.debug({ responseData });

      if (responseData.errors) {
        throw new Error(`GraphQL Error: ${responseData.errors[0].message}`);
      }

      if (!responseData || !responseData.data) {
        throw new Error("Invalid response data");
      }

      setListings(responseData.data.listings.items.map((l: Domain) => ({
        ...l,
        name: l.name.endsWith(".eth") ? l.name : `${l.name}.eth`,
        status: RentalStatus.listed,
      })));
      setIsLoading(false);
    };

    fetchListings();
  }, [lender]);

  return [listings, isLoading];
}
