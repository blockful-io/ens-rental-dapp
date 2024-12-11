import { useState, useEffect } from "react";
import { ensRentGraphQL } from "@/src/wagmi";

import { Domain, RentalStatus } from "@/src/types";

export default function useListings({ lender }: { lender: string }): [Domain[], Domain[], Domain[], boolean] {
  const [listings, setListings] = useState<Domain[]>([]);
  const [rentalIns, setRentalIns] = useState<Domain[]>([]);
  const [rentalOuts, setRentalOuts] = useState<Domain[]>([]);

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
                    rentals(where: {endTime_gte: "${Math.floor(Date.now() / 1000)}"}) {
                      items {
                        borrower
                      }
                    }
                  }
                }
                rentalIns: rentals(where: {borrower: $lender}) {
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
                rentalOuts: listings(
                  where: {lender: $lender}
                ) {
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
                    rentals(where: {endTime_gte: "${Math.floor(Date.now() / 1000)}"}) {
                      items {
                        borrower
                        endTime
                        startTime
                      }
                    }
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

      if (responseData.errors) {
        throw new Error(`GraphQL Error: ${responseData.errors[0].message}`);
      }

      if (!responseData || !responseData.data) {
        throw new Error("Invalid response data");
      }

      setListings(responseData.data.listings.items.filter((l: any) => l.rentals?.items?.length === 0).map((l: Domain) => ({
        ...l,
        name: l.name.endsWith(".eth") ? l.name : `${l.name}.eth`,
        status: RentalStatus.listed,
      })));

      setRentalIns(responseData.data.rentalIns.items.map((rental: any) => ({
        ...rental.listing,
        name: rental.listing.name.endsWith(".eth") ? rental.listing.name : `${rental.listing.name}.eth`,
        status: RentalStatus.rentedIn,
        rentals: { items: [rental] },
        borrower: rental.borrower
      })));

      setRentalOuts(responseData.data.listings.items
        .filter((listing: any) => listing.rentals?.items?.length > 0)
        .map((listing: any) => ({
          ...listing,
          name: listing.name.endsWith(".eth") ? listing.name : `${listing.name}.eth`,
          status: RentalStatus.rentedOut,
          borrower: listing.rentals.items[0].borrower
        })));

      setIsLoading(false);
    };

    fetchListings();
  }, [lender]);

  return [listings, rentalIns, rentalOuts, isLoading];
}
