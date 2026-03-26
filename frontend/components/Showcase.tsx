"use client";

import { motion } from "framer-motion";

const contacts = [
	{
		initials: "S",
		name: "Sara",
		preview: "caught this on my walk",
		time: "7:44 PM",
		online: true,
		unread: 2,
	},
	{
		initials: "J",
		name: "James",
		preview: "sounds good, see you then!",
		time: "3:21 PM",
		online: false,
		unread: 0,
	},
	{
		initials: "A",
		name: "Aisha",
		preview: "haha yes exactly 😂",
		time: "Yesterday",
		online: true,
		unread: 0,
	},
	{
		initials: "R",
		name: "Riya",
		preview: "okay I'll send the photo",
		time: "Mon",
		online: false,
		unread: 0,
	},
];

const thread = [
	{
		from: "them",
		type: "text",
		text: "hey! you free tonight?",
		time: "7:42 PM",
	},
	{
		from: "me",
		type: "text",
		text: "yeah what's up 😊",
		time: "7:43 PM",
		seen: true,
	},
	{
		from: "them",
		type: "image",
		time: "7:44 PM",
		caption: "caught this on my walk",
	},
	{
		from: "me",
		type: "text",
		text: "omg that's beautiful 😭",
		time: "7:44 PM",
		seen: true,
	},
	{
		from: "me",
		type: "text",
		text: "where is this?",
		time: "7:44 PM",
		seen: false,
	},
];

function DoubleTick({ seen }: { seen: boolean }) {
	return (
		<svg
			width="15"
			height="10"
			viewBox="0 0 15 10"
			fill="none"
			className="inline-block shrink-0"
		>
			<path
				d="M1 5l2.5 2.5L8 2"
				stroke={seen ? "#60a5fa" : "rgba(255,255,255,0.3)"}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5 5l2.5 2.5L12 2"
				stroke={seen ? "#60a5fa" : "rgba(255,255,255,0.3)"}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default function Showcase() {
	return (
		<section className="py-24 px-6">
			<div className="max-w-5xl mx-auto">
				<div className="mb-14">
					<p className="text-xs font-medium tracking-widest text-white/25 uppercase mb-4">
						Product
					</p>
					<h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white max-w-md leading-tight">
						Simple by design.
						<br />
						<span className="text-white/35">Feels like home.</span>
					</h2>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-60px" }}
					transition={{ duration: 0.55, ease: "easeOut" }}
					className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden"
				>
					<div className="flex h-[420px]">
						{/* Contacts sidebar */}
						<div className="w-60 border-r border-white/[0.06] flex flex-col shrink-0">
							{/* Search */}
							<div className="px-4 pt-4 pb-3">
								<div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2">
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="rgba(255,255,255,0.25)"
										strokeWidth="2"
									>
										<circle cx="11" cy="11" r="8" />
										<line x1="21" y1="21" x2="16.65" y2="16.65" />
									</svg>
									<span className="text-xs text-white/20">Search</span>
								</div>
							</div>

							{/* Contact list */}
							<div className="flex-1 overflow-y-auto">
								{contacts.map((c, i) => (
									<div
										key={c.name}
										className={`flex items-center gap-3 px-4 py-3 cursor-default transition-colors ${
											i === 0 ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
										}`}
									>
										<div className="relative shrink-0">
											<div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/55">
												{c.initials}
											</div>
											{c.online && (
												<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f0f0f]" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-white/80 truncate">
													{c.name}
												</span>
												<span className="text-[10px] text-white/25 ml-1 shrink-0">
													{c.time}
												</span>
											</div>
											<div className="flex items-center justify-between mt-0.5">
												<p className="text-xs text-white/35 truncate pr-2">
													{c.preview}
												</p>
												{c.unread > 0 && (
													<span className="w-4 h-4 rounded-full bg-white text-[#0a0a0a] text-[9px] font-bold flex items-center justify-center shrink-0">
														{c.unread}
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Chat panel */}
						<div className="flex-1 flex flex-col min-w-0">
							{/* Chat header */}
							<div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
								<div className="relative shrink-0">
									<div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white/55">
										S
									</div>
									<span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0f0f0f]" />
								</div>
								<div>
									<p className="text-sm font-semibold text-white leading-none">
										Sara
									</p>
									<p className="text-xs text-emerald-400/75 mt-0.5">Online</p>
								</div>
								<div className="ml-auto flex items-center gap-3 text-white/25">
									<svg
										width="15"
										height="15"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
									</svg>
									<svg
										width="15"
										height="15"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<circle cx="12" cy="12" r="1" />
										<circle cx="19" cy="12" r="1" />
										<circle cx="5" cy="12" r="1" />
									</svg>
								</div>
							</div>

							{/* Messages */}
							<div className="flex-1 flex flex-col gap-2.5 px-5 py-4 overflow-y-auto">
								{thread.map((msg, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, y: 6 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.28, delay: i * 0.055 }}
										className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
									>
										{msg.type === "image" ? (
											<div className="flex flex-col gap-1 max-w-[55%]">
												<div className="w-40 h-24 rounded-xl overflow-hidden border border-white/[0.09]">
													<img
														src="https://images.unsplash.com/photo-1599600197870-4bfaf17d5f42?q=80&w=1170&auto=format&fit=crop"
														alt="sunset"
														className="w-full h-full object-cover"
													/>
												</div>
												{msg.caption && (
													<p className="text-xs text-white/35 px-0.5">
														{msg.caption}
													</p>
												)}
											</div>
										) : (
											<div
												className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug ${
													msg.from === "me"
														? "bg-white text-[#0a0a0a] font-medium rounded-br-sm"
														: "bg-white/[0.07] border border-white/[0.07] text-white/80 rounded-bl-sm"
												}`}
											>
												{msg.text}
												{msg.from === "me" && (
													<span className="inline-flex items-center gap-1 ml-2 align-middle">
														<span className="text-[10px] text-black/30">
															{msg.time}
														</span>
														<DoubleTick seen={msg.seen ?? false} />
													</span>
												)}
											</div>
										)}
									</motion.div>
								))}

								{/* Typing indicator */}
								<div className="flex justify-start">
									<div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/[0.07]">
										{[0, 1, 2].map((i) => (
											<motion.span
												key={i}
												className="w-1.5 h-1.5 rounded-full bg-white/35"
												animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
												transition={{
													duration: 1.1,
													repeat: Infinity,
													delay: i * 0.18,
												}}
											/>
										))}
									</div>
								</div>
							</div>

							{/* Input */}
							<div className="px-5 py-3.5 border-t border-white/[0.06] flex items-center gap-2.5">
								<button className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/30 hover:text-white/55 transition-colors">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<rect x="3" y="3" width="18" height="18" rx="2" />
										<circle cx="8.5" cy="8.5" r="1.5" />
										<polyline points="21 15 16 10 5 21" />
									</svg>
								</button>
								<div className="flex-1 text-sm text-white/20 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.06]">
									Message Sara...
								</div>
								<button className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#0a0a0a]">
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
									>
										<line x1="22" y1="2" x2="11" y2="13" />
										<polygon points="22 2 15 22 11 13 2 9 22 2" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
