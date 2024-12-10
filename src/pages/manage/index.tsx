import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Search, Timer, Tag } from "lucide-react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import useDomainsByAddress from "@/src/hooks/useDomains";
import { useAccount } from "wagmi";
import { Domain, RentalStatus } from "@/src/types";
import useListings from "@/src/hooks/useListings";
import { formatEther } from "viem";

export default function RegisteredDomains() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filteredStatus, setFilteredStatus] = useState<RentalStatus | "all">(
    RentalStatus.rented
  );
  const router = useRouter();
  const [unlistDomain, setUnlistDomain] = useState<Pick<
    Domain,
    "id" | "name"
  > | null>(null);
  const { address } = useAccount();

  if (!address) return <div>Loading...</div>;

  const [listings] = useListings({ lender: address });

  const [availableNames, isLoading, error] = useDomainsByAddress(address);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);

  useEffect(() => {
    async function getDomains() {
      const filteredDomains: Domain[] = [
        ...availableNames.map(
          (name: string, i: number): Domain => ({
            id: i.toString(),
            name,
            available: false,
            status: RentalStatus.available,
            maxRentalTime: "",
            price: 0,
            lender: "",
            createdAt: "",
            isWrapped: false,
            node: "",
            tokenId: "",
            borrower: "",
          })
        ),
        ...listings,
      ]
        .filter(
          (domain) =>
            domain.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filteredStatus === "all" || domain.status === filteredStatus)
        )
        .sort((a, b) => {
          switch (sortBy) {
            case "name":
              return a.name.localeCompare(b.name);
            case "expiry":
              return (
                new Date(a.maxRentalTime).getTime() -
                new Date(b.maxRentalTime).getTime()
              );
            case "price":
              return a.price - b.price;
            default:
              return 0;
          }
        });

      setFilteredDomains(filteredDomains);
    }

    getDomains();
  }, [availableNames, filteredStatus]);

  const handleUnlist = () => unlistDomain && setUnlistDomain(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")} variant="outline">
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8 ">
        <Card>
          <CardHeader>
            <CardTitle>My Registered Domains</CardTitle>
            <CardDescription>
              Manage your registered ENS domains and their rental status - Show
              lend domains and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search and Filter Controls */}
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
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="expiry">Expiry Date</SelectItem>
                    <SelectItem value="price">Rental Price</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filteredStatus}
                  onValueChange={(value: string) =>
                    setFilteredStatus(value as RentalStatus | "all")
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      {filteredStatus === "all" ? (
                        "All Status"
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            filteredStatus
                          )}`}
                        >
                          {filteredStatus.charAt(0).toUpperCase() +
                            filteredStatus.slice(1)}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          "available"
                        )}`}
                      >
                        Available
                      </span>
                    </SelectItem>
                    <SelectItem value="rented">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          "rented"
                        )}`}
                      >
                        Rented
                      </span>
                    </SelectItem>
                    <SelectItem value="listed">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          "listed"
                        )}`}
                      >
                        Listed
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Domains Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain Name</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Renter</TableHead>
                      <TableHead>Rental Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDomains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">
                          {domain.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-gray-500" />
                            {domain.maxRentalTime ? (
                              <>
                                <span>
                                  {new Date(
                                    parseInt(domain.maxRentalTime) * 1000
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({getTimeUntilExpiry(domain.maxRentalTime)}{" "}
                                  days left)
                                </span>
                              </>
                            ) : (
                              <span>N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              domain.status
                            )}`}
                          >
                            {domain.status.charAt(0).toUpperCase() +
                              domain.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{domain.borrower || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            {formatEther(BigInt(domain.price))} ETH
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {domain.status === "available" && (
                              <Button
                                size="sm"
                                className="w-28"
                                variant="outline"
                                onClick={() =>
                                  router.push(`/lend?domain=${domain.name}`)
                                }
                              >
                                List for Rent
                              </Button>
                            )}
                            {domain.status === "listed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-28"
                                onClick={() =>
                                  setUnlistDomain({
                                    id: domain.id,
                                    name: domain.name,
                                  })
                                }
                              >
                                Unlist
                              </Button>
                            )}
                            {domain.status === "rented" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-28"
                                onClick={() =>
                                  router.push(`/manage/${domain.name}`)
                                }
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!unlistDomain} onOpenChange={() => setUnlistDomain(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Unlist</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlist {unlistDomain?.name}? This will
              remove it from the rental marketplace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlistDomain(null)}>
              Cancel
            </Button>
            <Button onClick={handleUnlist}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    case "rented":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    case "listed":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const getTimeUntilExpiry = (expiryDate: string) => {
  const now = new Date();
  const expiry = new Date(parseInt(expiryDate) * 1000);
  const daysLeft = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysLeft;
};
