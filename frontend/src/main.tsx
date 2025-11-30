import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

import ClothingListPage from "./pages/ClothingListPage";
import StylesPage from "./pages/StylesPages";
import OutfitGeneratorPage from "./pages/OutfitsGeneratorPage";
import OutfitsListPage from "./pages/OutfitsListPage";

import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <App />,
                children: [
                    { index: true, element: <Navigate to="/clothing" replace /> },
                    { path: "clothing", element: <ClothingListPage /> },
                    { path: "styles", element: <StylesPage /> },
                    { path: "outfits", element: <OutfitsListPage /> },
                    { path: "generate", element: <OutfitGeneratorPage /> },
                ],
            },
        ],
    },
]);

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={qc}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
