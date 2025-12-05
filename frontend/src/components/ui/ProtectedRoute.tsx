"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "./Loader";

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(userData);
      const userRoles = user?.roles || [];

      const hasAccess = userRoles.some((r: string) =>
        allowedRoles.includes(r)
      );

      if (hasAccess) {
        setAuthorized(true);
      } else {
        router.push("/unauthorized");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [allowedRoles, router]);

  if (loading) return <Loader />;

  return authorized ? <>{children}</> : null;
}
