import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { Shirt, Stars, Wand2, ListChecks, User, Settings, Menu } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export default function App() {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const linkCls = ({ isActive }: { isActive: boolean }) =>
        `flex px-3 py-2 rounded-md text-sm font-medium ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`;
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="flex flex-col min-h-dvh">
                <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-background/10 border-b">
                    <div className="flex items-center w-full h-14 px-4">
                        <div className="hidden md:flex items-center mr-auto">
                            <Wand2 className="w-5 h-5 mr-2" />
                            <span className="text-xl font-semibold">FitFlow</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2 mr-auto">
                            <NavLink to="/clothing" className={linkCls}>
                                <Shirt className="inline w-4 h-4 my-auto mr-1" />
                                Clothes
                            </NavLink>
                            <NavLink to="/styles" className={linkCls}>
                                <Stars className="inline w-4 h-4 my-auto mr-1" />
                                Styles
                            </NavLink>
                            <NavLink to="/generate" className={linkCls}>
                                <Wand2 className="inline w-4 h-4 my-auto mr-1" />
                                Generator
                            </NavLink>
                            <NavLink to="/outfits" className={linkCls}>
                                <ListChecks className="inline w-4 h-4 my-auto mr-1" />
                                Outfits
                            </NavLink>
                            <NavLink to="/profile" className={linkCls}>
                                <User className="inline w-4 h-4 my-auto mr-1" />
                                Profile
                            </NavLink>
                            <NavLink to="/settings" className={linkCls}>
                                <Settings className="inline w-4 h-4 my-auto mr-1" />
                                Settings
                            </NavLink>
                        </nav>

                        {/* Mobile Navigation */}
                        <div className="md:hidden mr-auto ml-0 pl-0">
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Menu className="w-5 h-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <div className="flex flex-col gap-4 mt-12 px-1">
                                        <NavLink to="/clothing" className={linkCls} onClick={() => setIsOpen(false)}>
                                            <Shirt className="inline w-4 h-4 my-auto mr-1" />
                                            Clothes
                                        </NavLink>
                                        <NavLink to="/styles" className={linkCls} onClick={() => setIsOpen(false)}>
                                            <Stars className="inline w-4 h-4 my-auto mr-1" />
                                            Styles
                                        </NavLink>
                                        <NavLink to="/generate" className={linkCls} onClick={() => setIsOpen(false)}>
                                            <Wand2 className="inline w-4 h-4 my-auto mr-1" />
                                            Generator
                                        </NavLink>
                                        <NavLink to="/outfits" className={linkCls} onClick={() => setIsOpen(false)}>
                                            <ListChecks className="inline w-4 h-4 my-auto mr-1" />
                                            Outfits
                                        </NavLink>
                                        <NavLink to="/profile" className={linkCls} onClick={() => setIsOpen(false)}>
                                            <User className="inline w-4 h-4 my-auto mr-1" />
                                            Profile
                                        </NavLink>
                                        <NavLink to="/settings" className={linkCls} onClick={() => setIsOpen(false)}>
                                            <Settings className="inline w-4 h-4 my-auto mr-1" />
                                            Settings
                                        </NavLink>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-auto mb-2 px-2">
                                        <ModeToggle />
                                        <Button variant="outline" size="sm" onClick={() => logout()}>
                                            Logout
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className="md:hidden flex items-center ">
                            <Wand2 className="w-5 h-5 mr-2" />
                            <span className="text-xl font-semibold">FitFlow</span>
                        </div>
                        <div className="md:hidden flex items-center ml-auto">
                            <div className="w-9 h-9"></div>{" "}
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <ModeToggle />
                            <Button variant="outline" size="sm" onClick={() => logout()}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="container py-6 mx-auto">
                    <Outlet />
                </main>
                <Toaster />
            </div>
        </ThemeProvider>
    );
}
