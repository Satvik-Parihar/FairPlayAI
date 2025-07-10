import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "@/lib/auth";

const OAuthUserSync = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const email = params.get("email");
        const name = params.get("name");

        if (email && name) {
            setUser({ email, name });
            // Replace current URL (remove query params)
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    return null;
};

export default OAuthUserSync;
