import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
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
import { Search, Clock, TrendingDown, LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/router";
import useAvailableDomains from "@/src/hooks/useAvailableDomains";
import { useAccount } from "wagmi";

type ViewMode = "grid" | "table";

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const router = useRouter();
  const { address } = useAccount();

  const [availableDomains, isLoading, error] = useAvailableDomains(address);

  const filteredDomains = availableDomains
    .filter((domain) =>
      domain.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") return Number(a.price) - Number(b.price);
      if (sortBy === "time")
        return Number(a.maxRentalTime) - Number(b.maxRentalTime);
      return 0;
    });

  const TableView = () => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-white text-black">
            <TableHead>Domain Name</TableHead>
            <TableHead>Price per year</TableHead>
            <TableHead>Maximum Rental Time</TableHead>
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
                <Button
                  size="sm"
                  onClick={() => router.push(`/auctions/simple/${domain.name}`)}
                >
                  Rent Now
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto py-8">
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
                    <SelectItem value="time">Time Left: Low to High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
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
      </div>
    </div>
  );
}
