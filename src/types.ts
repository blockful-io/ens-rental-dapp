export enum RentalStatus {
  available = "available",
  rented = "rented",
  listed = "listed",
}

export type Domain = {
  id: number;
  domain: string;
  name: string
  registrationDate: string;
  expiryDate: string;
  rentalStatus: RentalStatus;
  currentRenter: string | null;
  rentPrice: number;
  isListed: boolean;
};