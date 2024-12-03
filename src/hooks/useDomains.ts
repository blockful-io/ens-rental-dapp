import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { getNamesForAddress } from "@ensdomains/ensjs/subgraph";
import { Address } from "viem";
import { PublicClient } from "viem";
import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";

export default function useDomainsByAddress(
  address: Address | undefined,
): [string[], boolean, Error | null] {
  const [names, setNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  useEffect(() => {
    const getNames = async (address: Address) => {
      setIsLoading(true);

      try {
        const result = await getNamesForAddress(publicClient, {
          address: address,
        });
        setNames(result.map((object) => object.name!));
      } catch (error) {
        setError(new Error("An error occurred fetching domains"));
      } finally {
        setIsLoading(false);
      }
    };

    if (address) getNames(address);
  }, [address, address]);

  return [names, isLoading, error];
}