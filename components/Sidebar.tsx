'use client';
import { useState, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { FaGear } from "react-icons/fa6";
import Link from "next/link";

import { User } from "@/lib/types";

interface SidebarProps {
    user: User;
    setUser: Dispatch<SetStateAction<User | null>>;
}

export default function Sidebar({ user, setUser }: SidebarProps) {


    return (
        <div className="h-full bg-[#1d1c1b] p-3 sm:py-6 flex flex-row sm:flex-col items-center justify-between border-b sm:border-b-0 sm:border-r border-white/10">
            <div className="flex items-center justify-center">
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="Reze Logo"
                        width={40}
                        height={40}
                        className="rounded-full shadow-lg"
                    />
                </Link>
            </div>

            <Link
                href="/account"
                className="flex items-center justify-center p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
            >
                <FaGear className="text-gray-400 text-xl group-hover:text-white transition-colors" />
            </Link>
        </div>
    )
}
