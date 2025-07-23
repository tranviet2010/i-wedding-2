import { Toaster } from "@/components/ui/toaster";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { signIn } from "../features/auth/authSlice";

const LayoutEditor = () => {
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        // Extract token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
            try {
                const decodedToken = atob(token);
                
                if (decodedToken) {
                    dispatch(signIn({ 
                        accessToken: decodedToken, 
                        refreshToken: '',
                        userId: 0,
                        walletAddress: '',
                        avatar: '',
                        signature: '',
                        wallet: '',
                        signMessage: '',
                        username: '',
                        email: ''
                    }));
                }
            } catch (error) {
                console.error('Failed to parse token:', error);
            }
        }
    }, [location, dispatch]);

    return (
        <div
            className={`min-h-screen flex flex-col`}
        >
            <main className="flex gap-2 ">
                <div className="p-4 mx-auto max-w-screen-xl w-full">
                    <Outlet />
                </div>
                <Toaster />
            </main>
        </div>
    );
};

export default LayoutEditor;
