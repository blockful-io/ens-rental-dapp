import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Search, Clock, TrendingDown } from "lucide-react";
import { useRouter } from "next/router";
import useAvailableDomains from "@/src/hooks/useAvailableDomains";
import { useAccount, useEnsName } from "wagmi";
import useRentedDomains, {
  RentedDomainType,
} from "@/src/hooks/useRentedDomains";
import { formatEther } from "viem";
import Link from "next/link";
import { Domain } from "@/src/types";

const EnsName = ({ address }: { address: `0x${string}` }) => {
  const { data: ensName } = useEnsName({ address });

  return ensName ? (
    <span className="text-blue-500">
      <Link
        target="_blank"
        href={`https://app.ens.domains/${ensName}`}
        className="hover:text-blue-600 transition-all duration-300"
      >
        {ensName}
      </Link>
    </span>
  ) : (
    address
  );
};

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRented, setSearchRented] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [orderRented, setOrderRented] = useState("time");
  const router = useRouter();
  const { address } = useAccount();

  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [
    getInitialPage,
    getNextPage,
    getPreviousPage,
    hasNextPage,
    hasPreviousPage,
  ] = useAvailableDomains(address);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const domains = await getInitialPage(searchTerm, sortBy);
        setAvailableDomains(domains);
      } catch (err) {
        console.log("err", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [searchTerm, sortBy]);

  const handleNextPage = async () => {
    try {
      setIsLoading(true);
      const domains = await getNextPage(searchTerm, sortBy);
      setAvailableDomains(domains);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = async () => {
    try {
      setIsLoading(true);
      const domains = await getPreviousPage(searchTerm, sortBy);
      setAvailableDomains(domains);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const [rentedDomains, isLoadingRented, errorRented] =
    useRentedDomains(address);

  const filteredDomains = availableDomains;

  const rentedFilteredDomains = rentedDomains
    .filter((domain: any) =>
      domain.listing.name.toLowerCase().includes(searchRented.toLowerCase())
    )
    .sort((a, b) => {
      if (orderRented === "price")
        return Number(b.listing.price) - Number(a.listing.price);
      if (orderRented === "time")
        return Number(b.startTime) - Number(a.startTime);
      return 0;
    });

  const TableView = () => (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white text-black">
              <TableHead>Domain Name</TableHead>
              <TableHead>Price per year</TableHead>
              <TableHead>Maximum Rental Time</TableHead>
              <TableHead>Lender</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDomains.map((domain) => (
              <TableRow key={domain.id}>
                <TableCell className="font-medium">{domain.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 text-green-500 mr-2" />
                    {domain.price} ETH
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    {new Date(
                      Number(domain.maxRentalTime) * 1000
                    ).toLocaleDateString("en-GB")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <EnsName address={domain.lender as `0x${string}`} />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/auctions/simple/${domain.name}`)
                    }
                  >
                    Rent Now
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={isLoading || !hasPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={isLoading || !hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const RentedTableView = () => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-white text-black">
            <TableHead>Domain Name</TableHead>
            <TableHead>Price per year</TableHead>
            <TableHead>Rental Start</TableHead>
            <TableHead>Rental End</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Lender</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentedFilteredDomains.map((domain: RentedDomainType) => {
            return (
              <TableRow
                key={domain.listing.id}
                className={"bg-gray-100 hover:bg-gray-100"}
              >
                <TableCell className="font-medium">
                  {`${domain.listing.name}.eth`}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 text-green-500 mr-2" />
                    {formatEther(
                      BigInt(domain.listing.price) * BigInt(365 * 24 * 60 * 60)
                    )}
                    ETH
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    {new Date(
                      Number(domain.startTime) * 1000
                    ).toLocaleDateString("en-GB")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    {new Date(Number(domain.endTime) * 1000).toLocaleDateString(
                      "en-GB"
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <EnsName address={domain.borrower as `0x${string}`} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <EnsName address={domain.listing.lender as `0x${string}`} />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled
                    onClick={() =>
                      router.push(`/auctions/simple/${domain.listing.name}`)
                    }
                  >
                    Already Rented
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Available ENS Domains</CardTitle>
            <CardDescription>
              Browse and rent available ENS domains - Show all domains available
              for rent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search domains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="time">Time Left: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <p>Loading available domains...</p>
              ) : error ? (
                <p>Error: {error.message}</p>
              ) : (
                <TableView />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Rented ENS Domains</CardTitle>
            <CardDescription>
              Browse and check what you missed out on - FOMO guaranteed! 🔥
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search domains..."
                    value={searchRented}
                    onChange={(e) => setSearchRented(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={orderRented} onValueChange={setOrderRented}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Highest Price</SelectItem>
                    <SelectItem value="time">Recently Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingRented ? (
                <p>Loading available domains...</p>
              ) : errorRented ? (
                <p>Error: {errorRented.message}</p>
              ) : (
                <RentedTableView />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
