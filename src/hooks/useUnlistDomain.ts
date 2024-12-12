import { useState } from 'react';
import { createWalletClient, custom, Hex, labelhash, publicActions } from 'viem';
import { config, ensRentAddress } from '@/src/wagmi';
import ensRentABI from '@/abis/ensrent.json';

export function useUnlistDomain() {
  const [isUnlisting, setIsUnlisting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unlistDomain = async (account: Hex, domainName: string): Promise<boolean> => {
    setIsUnlisting(true);
    setError(null);

    try {
      const walletClient = createWalletClient({
        account,
        transport: custom(window.ethereum),
        chain: config.chains[0],
      }).extend(publicActions);

      const tokenId = BigInt(labelhash(domainName.replace(".eth", "")));

      const hash = await walletClient.writeContract({
        address: ensRentAddress,
        abi: ensRentABI,
        functionName: "reclaimDomain",
        args: [tokenId],
      });

      await walletClient.waitForTransactionReceipt({ hash });
      return true
    } catch (err) {
      setError(new Error("Failed to unlist domain"));
      return false
    } finally {
      setIsUnlisting(false);
    }
  };

  return { unlistDomain, isUnlisting, error };
} 