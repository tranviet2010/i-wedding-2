import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";
import MenuDrawer from "./MenuDrawer";
const Layout = () => {
    return (
        <div
            className={`min-h-screen flex flex-col`}
        >
            <main className="flex gap-2 ">
                <MenuDrawer />
                <div className="p-4 mx-auto max-w-screen-xl w-full">

                    <Outlet />
                </div>
                <Toaster />
            </main>
        </div>
    );
};

export default Layout;
