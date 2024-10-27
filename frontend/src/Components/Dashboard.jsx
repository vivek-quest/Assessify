import React, { useState } from "react";
import {
    IconArrowLeft,
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink, SidebarLinkProfile } from "./Sidebar";
import AssessifyLogo from '../assets/Images/Assessify.png'
import { UserAtom } from "../Atoms/AtomStores";
import { useAtom } from "jotai";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function DashBoard({ children }) {
    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <IconBrandTabler className="text-neutral-700 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile",
            href: "/profile",
            icon: (
                <IconUserBolt className="text-neutral-700 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Logout",
            href: "/dashboard",
            icon: (
                <IconArrowLeft className="text-neutral-700 h-5 w-5 flex-shrink-0" onClick={() => window.location.reload()} />
            ),
            handleClick: () => {
                window.location.reload();
            }
        },
    ];

    const [open, setOpen] = useState(false);
    const [userDetails] = useAtom(UserAtom);

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-gray-200 w-full h-[100vh] border border-neutral-200 overflow-hidden"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} className={'link-hover'} handleClick={link.handleClick} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col overflow-y-auto overflow-x-hidden">
                        <SidebarLinkProfile
                            link={{
                                label: userDetails?.name || 'User',
                                href: "#",
                                icon: (
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails?.name?.split(' ')?.join('-') || 'User')}&size=50&background=random`}
                                        className="h-7 w-7 flex-shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                        name={userDetails?.name || 'User'}
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <DashboardChild>{children}</DashboardChild>
        </div>
    );
}

export const Logo = () => {
    return (
        <Link
            to="/dashboard"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img src={AssessifyLogo} className="h-[50px] w-[50px]" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-gray-900 whitespace-pre"
            >
                Assessify
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            to="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img src={AssessifyLogo} className="h-[50px] w-[50px]" />
        </Link>
    );
};

const DashboardChild = ({ children }) => {
    return <div className="w-full h-full overflow-auto">{children}</div>;
};
