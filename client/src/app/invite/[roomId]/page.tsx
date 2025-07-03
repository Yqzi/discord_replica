"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InviteRedirectPage({
    params,
}: {
    params: { roomId: string };
}) {
    const router = useRouter();

    useEffect(() => {
        // Store roomId in sessionStorage and redirect without query param
        if (typeof window !== "undefined") {
            sessionStorage.setItem("inviteRoomId", params.roomId);
            setTimeout(() => {
                router.replace("/components");
            }, 50); // 50ms delay ensures sessionStorage is written
        }
    }, [params.roomId, router]);

    return null;
}
