"use client";
import { useParams } from "next/navigation";
import Room from "../page";

export default function RoomPage({ params }: { params: { roomID: string } }) {
    return (
        <div>
            <Room roomID={params.roomID}></Room>
        </div>
    );
}
