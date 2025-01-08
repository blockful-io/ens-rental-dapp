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
import { useMemo, useState } from "react";

const oneYearInSeconds = 365 * 24 * 60 * 60;
const pageSize = 3;
const calculateYearlyPrice = (pricePerSecond: string | number): bigint => {
  return BigInt(pricePerSecond || 0) * BigInt(oneYearInSeconds);
};

export default function useAvailableDomains(
  lender: Address | undefined
): [() => Promise<Domain[]>, () => Promise<Domain[]>, boolean, boolean] {
  const chainId = useChainId();
  const ensRentGraphQL = getEnsRentGraphQL(chainId);

  // Pagination state
  const [startCursorState, setStartCursorState] = useState<string | null>(null);
  const [endCursorState, setEndCursorState] = useState<string | null>(null);
  const [hasNextPageState, setHasNextPageState] = useState<boolean>(false);
  const [hasPreviousPageState, setHasPreviousPageState] =
    useState<boolean>(false);

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: ensRentGraphQL,
        cache: new InMemoryCache(),
      }),
    [ensRentGraphQL]
  );

  // Move the domain formatting logic to a separate function for reuse
  const formatDomainsData = (queryData: any): Domain[] => {
    let result: Domain[] = [];

    if (queryData?.listings?.items) {
      const availableDomains = queryData.listings.items.map(
        (listing: Domain) => {
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
        }
      );

      result = availableDomains.filter((domain: any) => {
        const lastRentEndTime = domain?.rentals?.items[0]?.endTime;
        return !lastRentEndTime || lastRentEndTime < Date.now() / 1000;
      });
    }

    return result;
  };

  const getNextPage = async (): Promise<Domain[]> => {
    const afterParam = endCursorState ? `, after: "${endCursorState}"` : "";

    const { data } = await client.query({
      query: gql`
        query GetListings {
          listings(
            limit: ${pageSize},
            where: ${!!lender ? `{lender_not: "${lender}"}` : "{}"},
            ${afterParam}
          ) {
            items {
              id
              maxRentalTime
              createdAt
              isWrapped
              lender
              node
              name
              price
              tokenId
              rentals {
                items {
                  endTime
                  borrower
                }
              }
            }
            pageInfo {
              startCursor
              endCursor
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
    });

    setStartCursorState(data.listings.pageInfo.startCursor);
    setEndCursorState(data.listings.pageInfo.endCursor);
    setHasNextPageState(data.listings.pageInfo.hasNextPage);
    setHasPreviousPageState(data.listings.pageInfo.hasPreviousPage);

    return formatDomainsData(data);
  };

  const getPreviousPage = async (): Promise<Domain[]> => {
    const beforeParam = startCursorState
      ? `, before: "${startCursorState}"`
      : "";

    const { data } = await client.query({
      query: gql`
        query GetListings {
          listings(
            limit: ${pageSize},
            where: ${!!lender ? `{lender_not: "${lender}"}` : "{}"},
            ${beforeParam}
          ) {
            items {
              id
              maxRentalTime
              createdAt
              isWrapped
              lender
              node
              name
              price
              tokenId
              rentals {
                items {
                  endTime
                  borrower
                }
              }
            }
            pageInfo {
              startCursor
              endCursor
              hasNextPage
              hasPreviousPage
            }
          }
        }
      `,
    });

    setStartCursorState(data.listings.pageInfo.startCursor);
    setEndCursorState(data.listings.pageInfo.endCursor);
    setHasNextPageState(data.listings.pageInfo.hasNextPage);
    setHasPreviousPageState(data.listings.pageInfo.hasPreviousPage);

    return formatDomainsData(data);
  };

  return [getNextPage, getPreviousPage, hasNextPageState, hasPreviousPageState];
}
