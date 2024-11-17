import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Clock, TrendingDown, LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/router";
import { Domain } from "@/src/types";
import { formatEther, parseEther } from "viem";

type ViewMode = "grid" | "table";

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const router = useRouter();

  const [domains, setDomains] = useState<
    Pick<Domain, "id" | "name" | "currentPrice" | "expiry">[]
  >([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_ENS_RENT_GRAPHQL_URL!,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
              {
                listings {
                  id
                  price
                  lender
                  active
                  blockNumber
                  name
                }
              }
            `,
            }),
          }
        );

        const { data } = await response.json();

        // Transform the data into the expected format
        const transformedData = data.listings
          .filter((listing: any) => listing.active)
          .map((listing: any, index: number) => ({
            id: index + 1,
            name: `${listing.name}.eth`,
            currentPrice: formatEther(listing.price),
            expiry: 3600, // Default 1 hour for now
          }));

        setDomains(transformedData);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setDomains([]);
      }
    };

    fetchListings();
  }, []);

  const filteredDomains = domains
    .filter((domain) =>
      domain.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") return a.currentPrice - b.currentPrice;
      if (sortBy === "time") return a.expiry - b.expiry;
      return 0;
    });

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDomains.map((domain) => (
        <Card key={domain.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              {domain.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <TrendingDown className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-lg font-medium">
                  {domain.currentPrice} ETH
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                <span>{Math.floor(domain.expiry / 60)} min left</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => router.push(`/auctions/simple/${domain.name}`)}
            >
              Rent Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-white text-black">
            <TableHead>Domain Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Time Left</TableHead>
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
                  {domain.currentPrice} ETH
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                  {Math.floor(domain.expiry / 60)} min
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
              Browse and rent available ENS domains
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

              {viewMode === "grid" ? <GridView /> : <TableView />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
