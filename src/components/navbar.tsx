import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/src/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mx-auto">
        <nav>
          <Link href="/" className="flex items-center space-x-2">
            {/* <Icons.logo className="size-6" /> */}
            <span className="inline-block font-bold">ENS Rent</span>
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link href="/browse">Rent</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/lend">List</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/manage">Manage</Link>
            </Button>
          </nav>
          {/* <nav className="flex items-center space-x-1">
            <ThemeToggle />
          </nav> */}
          <nav className="flex items-center space-x-1">
            <ConnectButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
