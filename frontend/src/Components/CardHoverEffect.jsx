// import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const HoverEffect = ({
    items,
    className
}) => {
    let [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        (<div
            className={cn("w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1", className)}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="relative group block p-1 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-[#e53935e6] block  rounded-2xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }} />
                        )}
                    </AnimatePresence>
                    <Card>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                        <div className="flex justify-between gap-5 items-center">
                            <p className="leading-relaxed text-sm">{item.createdAt}</p>
                            <Link to={`/interview/${item?.id}`}>
                                <button className="w-fit bg-[#e53935e6] text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2" >Start Interview</button>
                            </Link>
                        </div>
                    </Card>
                </div>
            ))}
        </div>)
    );
};

export const Card = ({
    className,
    children
}) => {
    return (
        (<div
            className={cn(
                "rounded-2xl h-full w-full overflow-hidden bg-white border border-transparent dark:border-white/[0.2] group-hover:border-[#e53935e6] relative z-20",
                className
            )}>
            <div className="relative z-50">
                <div className="p-4 flex flex-col gap-3">{children}</div>
            </div>
        </div>)
    );
};
export const CardTitle = ({
    className,
    children
}) => {
    return (
        (<h4 className={cn("text-black font-bold tracking-wide", className)}>
            {children}
        </h4>)
    );
};
export const CardDescription = ({
    className,
    children
}) => {
    return (
        (<p
            className={cn("text-zinc-600 tracking-wide leading-relaxed text-sm", className)}>
            {children}
        </p>)
    );
};
