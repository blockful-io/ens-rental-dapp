import { addEnsContracts } from '@ensdomains/ensjs';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ENS Rental',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    addEnsContracts(sepolia),
  ],
  ssr: true,
});