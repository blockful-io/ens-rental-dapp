import Link from "next/link";
import { Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Button } from "@/components/ui/button";
// import { Icons } from "@/components/icons";
// import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mx-auto">
        <nav>
          <Link href="/" className="flex items-center space-x-2">
            {/* <Icons.logo className="size-6" /> */}
            <span className="inline-block font-bold">ENS Rental HUB</span>
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* <nav className="flex items-center space-x-1">
            <ThemeToggle />
          </nav> */}
          <nav className="flex items-center space-x-1">
            <ConnectButton />
            {/* <Button variant="outline" className="flex items-center space-x-2">
              <Wallet className="size-4" /> */}
            {/* <span>Connect Wallet</span> */}
            {/* </Button> */}
          </nav>
        </div>
      </div>
    </header>
  );
}
