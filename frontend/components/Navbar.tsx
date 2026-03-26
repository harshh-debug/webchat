"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 16);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled
					? "bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06]"
					: "bg-transparent"
			}`}
		>
			<div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2 group">
					<div className="w-6 h-6 rounded-md bg-white/90 flex items-center justify-center">
						<svg
							width="14"
							height="14"
							viewBox="0 0 14 14"
							fill="none"
							className="text-[#0a0a0a]"
						>
							<path
								d="M2 3.5C2 2.67 2.67 2 3.5 2h7C11.33 2 12 2.67 12 3.5v5c0 .83-.67 1.5-1.5 1.5H8l-3 3v-3H3.5C2.67 10 2 9.33 2 8.5v-5z"
								fill="currentColor"
							/>
						</svg>
					</div>
					<span className="text-sm font-semibold tracking-tight text-white">
						WebChat
					</span>
				</Link>

				<nav className="hidden md:flex items-center gap-8">
					{["Features", "About"].map((item) => (
						<Link
							key={item}
							href={`#${item.toLowerCase()}`}
							className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200"
						>
							{item}
						</Link>
					))}
				</nav>

				<Link href="/login">
					<motion.button
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						className="text-sm px-4 py-1.5 rounded-md bg-white text-[#0a0a0a] font-medium hover:bg-white/90 transition-colors duration-200"
					>
						Get started
					</motion.button>
				</Link>
			</div>
		</header>
	);
}
