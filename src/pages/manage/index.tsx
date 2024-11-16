import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Timer, Tag } from "lucide-react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for registered domains
const registeredDomains = [
  {
    id: 1,
    domain: "crypto.eth",
    registrationDate: "2024-01-15",
    expiryDate: "2025-01-15",
    rentalStatus: "available", // available, rented, listed
    currentRenter: null,
    rentPrice: 0.5,
    isListed: false,
  },
  {
    id: 2,
    domain: "nft.eth",
    registrationDate: "2023-12-10",
    expiryDate: "2024-12-10",
    rentalStatus: "rented",
    currentRenter: "0x8765...4321",
    rentPrice: 0.8,
    isListed: true,
  },
  {
    id: 3,
    domain: "defi.eth",
    registrationDate: "2024-02-01",
    expiryDate: "2025-02-01",
    rentalStatus: "listed",
    currentRenter: null,
    rentPrice: 1.2,
    isListed: true,
  },
];

export default function RegisteredDomains() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filteredStatus, setFilteredStatus] = useState("all");
  const router = useRouter();
  const [unlistDomain, setUnlistDomain] = useState<{
    id: number;
    domain: string;
  } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft;
  };

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

  const filteredDomains = registeredDomains
    .filter(
      (domain) =>
        domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filteredStatus === "all" || domain.rentalStatus === filteredStatus)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.domain.localeCompare(b.domain);
        case "expiry":
          return (
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
        case "price":
          return a.rentPrice - b.rentPrice;
        default:
          return 0;
      }
    });

  const handleUnlist = () => {
    if (unlistDomain) {
      console.log(`Unlisting domain: ${unlistDomain.domain}`);
      setUnlistDomain(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8 ">
        <Card>
          <CardHeader>
            <CardTitle>My Registered Domains</CardTitle>
            <CardDescription>
              Manage your registered ENS domains and their rental status
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
                  onValueChange={setFilteredStatus}
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
                      <TableHead>Registration Date</TableHead>
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
                          {domain.domain}
                        </TableCell>
                        <TableCell>
                          {formatDate(domain.registrationDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(domain.expiryDate)}</span>
                            <span className="text-xs text-gray-500">
                              ({getTimeUntilExpiry(domain.expiryDate)} days
                              left)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              domain.rentalStatus
                            )}`}
                          >
                            {domain.rentalStatus.charAt(0).toUpperCase() +
                              domain.rentalStatus.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{domain.currentRenter || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            {domain.rentPrice} ETH
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {domain.rentalStatus === "available" && (
                              <Button
                                size="sm"
                                className="w-28"
                                variant="outline"
                                onClick={() =>
                                  router.push(`/lend?domain=${domain.domain}`)
                                }
                              >
                                List for Rent
                              </Button>
                            )}
                            {domain.rentalStatus === "listed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-28"
                                onClick={() =>
                                  setUnlistDomain({
                                    id: domain.id,
                                    domain: domain.domain,
                                  })
                                }
                              >
                                Unlist
                              </Button>
                            )}
                            {domain.rentalStatus === "rented" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-28"
                                onClick={() =>
                                  router.push(`/manage/${domain.domain}`)
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
              Are you sure you want to unlist {unlistDomain?.domain}? This will
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
