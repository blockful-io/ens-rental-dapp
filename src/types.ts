export enum RentalStatus {
  available = "available",
  rentedOut = "rented out",
  rentedIn = "rented in",
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