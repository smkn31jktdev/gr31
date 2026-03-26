import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

export function useSuperAdminAuth() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("adminToken");
      if (!token) {
        enqueueSnackbar("Anda tidak memiliki akses ke halaman ini", {
          variant: "error",
        });
        setIsAllowed(false);
        router.replace("/page/admin");
        return;
      }

      try {
        const res = await fetch("/api/auth/admin/me", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          enqueueSnackbar("Anda tidak memiliki akses ke halaman ini", {
            variant: "error",
          });
          router.replace("/page/admin");
          return;
        }
        const data = await res.json();
        if (data?.user?.email !== "smkn31jktdev@gmail.com") {
          enqueueSnackbar("Anda tidak memiliki akses ke halaman ini", {
            variant: "error",
          });
          setIsAllowed(false);
          router.replace("/page/admin");
          return;
        }
        setIsAllowed(true);
      } catch {
        enqueueSnackbar("Terjadi kesalahan autentikasi", { variant: "error" });
        setIsAllowed(false);
        router.replace("/page/admin");
      }
    };

    checkAuth();
  }, [router, enqueueSnackbar]);

  return { isAllowed };
}
