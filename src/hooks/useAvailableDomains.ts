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
): [
  (param?: string) => Promise<Domain[]>,
  (param?: string) => Promise<Domain[]>,
  (param?: string) => Promise<Domain[]>,
  boolean,
  boolean
] {
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

  const getNextPage = async (param?: string): Promise<Domain[]> => {
    const afterParam = endCursorState ? `, after: "${endCursorState}"` : "";
    const whereConditions = [];

    if (lender) whereConditions.push(`lender_not: "${lender}"`);
    if (param) whereConditions.push(`name_contains: "${param}"`);

    const whereClause = whereConditions.length
      ? `where: {${whereConditions.join(", ")}}`
      : "where: {}";

    const { data } = await client.query({
      query: gql`
        query GetListings {
          listings(
            limit: ${pageSize}
            ${whereClause}
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

  const getPreviousPage = async (param?: string): Promise<Domain[]> => {
    const beforeParam = startCursorState
      ? `, before: "${startCursorState}"`
      : "";
    const whereConditions = [];

    if (lender) whereConditions.push(`lender_not: "${lender}"`);
    if (param) whereConditions.push(`name_contains: "${param}"`);

    console.log("whereConditions", whereConditions);
    const whereClause = whereConditions.length
      ? `where: {${whereConditions.join(", ")}}`
      : "where: {}";

    const { data } = await client.query({
      query: gql`
        query GetListings {
          listings(
            limit: ${pageSize}
            ${whereClause}
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

  // Reset pagination state and get first page
  const getInitialPage = async (param?: string): Promise<Domain[]> => {
    // Reset pagination state
    setStartCursorState(null);
    setEndCursorState(null);
    setHasNextPageState(false);
    setHasPreviousPageState(false);

    const whereConditions = [];

    if (lender) whereConditions.push(`lender_not: "${lender}"`);
    if (param) whereConditions.push(`name_contains: "${param}"`);

    const whereClause = whereConditions.length
      ? `where: {${whereConditions.join(", ")}}`
      : "where: {}";

    const { data } = await client.query({
      query: gql`
        query GetListings {
          listings(
            limit: ${pageSize}
            ${whereClause}
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

  return [
    getInitialPage,
    getNextPage,
    getPreviousPage,
    hasNextPageState,
    hasPreviousPageState,
  ];
}
