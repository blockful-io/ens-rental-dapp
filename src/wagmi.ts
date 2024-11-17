import { addEnsContracts } from '@ensdomains/ensjs';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import {
  sepolia,
} from 'wagmi/chains';

if (!process.env.NEXT_PUBLIC_RENTAL_CONTRACT_ADDRESS) {
  throw new Error("NEXT_PUBLIC_RENTAL_CONTRACT_ADDRESS is not set");
}
if (!process.env.NEXT_PUBLIC_BASE_REGISTRAR_ADDRESS) {
  throw new Error("NEXT_PUBLIC_BASE_REGISTRAR_ADDRESS is not set");
}
if (!process.env.NEXT_PUBLIC_NAMEWRAPPER_ADDRESS) {
  throw new Error("NEXT_PUBLIC_NAMEWRAPPER_ADDRESS is not set");
}
if (!process.env.NEXT_PUBLIC_RPC_URL) {
  throw new Error("NEXT_PUBLIC_RPC_URL is not set");
}
if (!process.env.NEXT_PUBLIC_ENS_RENT_GRAPHQL_URL) {
  throw new Error("NEXT_PUBLIC_ENS_RENT_GRAPHQL_URL is not set");
}
if (!process.env.NEXT_PUBLIC_ENS_GRAPHQL_URL) {
  throw new Error("NEXT_PUBLIC_ENS_GRAPHQL_URL is not set");
}

export const config = getDefaultConfig({
  appName: 'ENS Rental',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    addEnsContracts(sepolia),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
});

export const ensRentAddress = process.env
  .NEXT_PUBLIC_RENTAL_CONTRACT_ADDRESS as `0x${string}`;
export const baseRegistrarAddress = process.env
  .NEXT_PUBLIC_BASE_REGISTRAR_ADDRESS as `0x${string}`;
export const nameWrapperAddress = process.env
  .NEXT_PUBLIC_NAMEWRAPPER_ADDRESS as `0x${string}`;

export const ensGraphQL = process.env.NEXT_PUBLIC_ENS_GRAPHQL_URL
export const ensRentGraphQL = process.env.NEXT_PUBLIC_ENS_RENT_GRAPHQL_URL
