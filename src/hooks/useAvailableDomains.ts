import {
  ApolloClient,
  gql,
  InMemoryCache,
  useQuery,
} from "@apollo/react-hooks";
import { getEnsRentGraphQL } from "@/src/wagmi";
import { Address, formatEther } from "viem";
import { Domain } from "@/src/types";
import { useChainId } from "wagmi";
import { useMemo } from "react";

const oneYearInSeconds = 365 * 24 * 60 * 60;

const calculateYearlyPrice = (pricePerSecond: string | number): bigint => {
  return BigInt(pricePerSecond || 0) * BigInt(oneYearInSeconds);
};

export default function useAvailableDomains(
  lender: Address | undefined
): [Domain[], boolean, Error | null] {
  const chainId = useChainId();
  const ensRentGraphQL = getEnsRentGraphQL(chainId);

  const GET_LISTINGS = useMemo(
    () => `
    query GetListings {
      listings(where: ${!!lender ? `{lender_not: "${lender}"}` : "{}"}) {
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
    [lender]
  );

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: ensRentGraphQL,
        cache: new InMemoryCache(),
      }),
    [ensRentGraphQL]
  );

  const { data, loading, error } = useQuery(
    gql`
      ${GET_LISTINGS}
    `,
    {
      client,
    }
  );

  if (error) {
    console.error("Error fetching available domains:", error);
  }

  const domains = useMemo(() => {
    let result: Domain[] = [];

    if (data?.listings?.items) {
      const availableDomains = data.listings.items.map((listing: Domain) => {
        const pricePerYear = calculateYearlyPrice(listing.price || 0);
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
      });

      result = availableDomains.filter((domain: any) => {
        const lastRentEndTime = domain?.rentals?.items[0]?.endTime;
        return !lastRentEndTime || lastRentEndTime < Date.now() / 1000;
      });
    }

    return result;
  }, [data, oneYearInSeconds]);

  return [domains, loading, error ?? null];
}
