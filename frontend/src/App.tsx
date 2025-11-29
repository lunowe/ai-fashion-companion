import { Outlet, NavLink } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { Shirt, Stars, Wand2, ListChecks, User } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function App() {
    const { logout } = useAuth();
    const linkCls = ({ isActive }: { isActive: boolean }) =>
        `flex px-3 py-2 rounded-md text-sm font-medium ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        }`;
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="flex flex-col min-h-dvh">
                <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-background/10 border-b">
                    <div className="flex items-center w-full h-14">
                        <div className="flex items-center ml-4 mr-auto">
                            <Wand2 className="w-5 h-5 mr-2" />
                            <span className="text-xl font-semibold">FitFlow</span>
                        </div>
                        <nav className="flex items-center gap-2 mr-auto">
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
                        </nav>
                        <div className="flex mr-4">
                            <ModeToggle />
                            <Button variant="outline" onClick={() => logout()}>
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
