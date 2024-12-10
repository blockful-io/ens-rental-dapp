export enum RentalStatus {
  available = "available",
  rented = "rented",
  listed = "listed",
}

export interface Domain {
  id: string;
  price: number;
  lender: string;
  borrower: string;
  name: string;
  isWrapped: boolean;
  createdAt: string;
  available: boolean;
  maxRentalTime: string;
  node: string;
  tokenId: string;
  status: RentalStatus;
}