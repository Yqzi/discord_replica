"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InviteRedirectPage({
    params,
}: {
    params: { roomId: string };
}) {
    const router = useRouter();
    const [showDialog, setShowDialog] = useState(false);
    const [roomId, setRoomId] = useState("");

    useEffect(() => {
        // Redirect to main page with roomId as query param
        router.replace(`/components?inviteRoomId=${params.roomId}`);
    }, [params.roomId, router]);

    return null;
}
