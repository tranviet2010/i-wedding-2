import DefaultAvatar from "@/assets/images/default-avatar.jpg";
import { selectAuth } from "@/features/auth/authSlice";

import { useState } from "react";
import { CiBellOn, CiUser } from "react-icons/ci";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { FiLayout, FiPlus, FiFile, FiMusic } from "react-icons/fi";

const routes = [
	{
		label: "Templates",
		href: "/",
		icon: <FiLayout />,
	},
	{
		label: "Pages",
		href: "/pages",
		icon: <FiFile />,
	},
	{
		label: "Audio Templates",
		href: "/audio-templates",
		icon: <FiMusic />,
	},
	{
		label: "Create",
		href: "/app/point/create",
		icon: <FiPlus />,
		children: [
			{
				label: "Overview",
				href: "/app/point",
			},
			{
				label: "History",
				href: "/app/point/history",
			},
		],
	}
];

export default function MenuDrawer() {
	const auth = useSelector(selectAuth);
	const location = useLocation();
	const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
	const toggleDropdown = (label: string) => {
		setOpenDropdowns((prev) =>
			prev.includes(label)
				? prev.filter((item) => item !== label)
				: [...prev, label]
		);
	};

	return (
		<div className="h-screen w-64 bg-white shadow-lg">
			<div className="p-4 border-b">
				<div className="flex justify-between items-center">
					<Link to={"/app"} className="font-bold text-xl">
						<CiUser />
					</Link>
					<div className="flex gap-4">
						<CiBellOn className="text-text-secondary cursor-pointer" />
					</div>
				</div>
			</div>
			<div className="p-4">
				<div className="flex flex-col gap-6 mt-4 text-black">
					{routes.map((route) => {
						const isActive = location.pathname === route.href;
						const hasChildren =
							route.children && route.children.length > 0;
						const isOpen = openDropdowns.includes(route.label);

						return (
							<div key={route.label}>
								{hasChildren ? (
									<div
										onClick={() => toggleDropdown(route.label)}
										className={`flex items-center justify-between px-4 py-4 rounded-lg transition-colors cursor-pointer`}
									>
										<div className="flex items-center gap-3">
											<span className={`text-text-dark text-xl`}>
												{route.icon}
											</span>
											<span>{route.label}</span>
										</div>
										<svg
											className={`w-4 h-4 transition-transform ${
												isOpen ? "rotate-180" : ""
											}`}
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								) : (
									<Link
										to={route.href}
										className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-colors ${
											isActive
												? "bg-primary-300"
												: "text-text-secondary hover:bg-gray-100"
										}`}
									>
										<span
											className={`text-xl ${
												isActive ? "text-primary-100" : "text-text-dark"
											}`}
										>
											{route.icon}
										</span>
										<span
											className={`${
												isActive
													? "text-primary-100"
													: "text-text-secondary"
											}`}
										>
											{route.label}
										</span>
									</Link>
								)}

								{/* Dropdown items */}
								{hasChildren && isOpen && (
									<div className="pl-8 mt-2 flex flex-col gap-2">
										{route.children.map((child) => {
											const isChildActive =
												location.pathname === child.href;
											return (
												<Link
													key={child.label}
													to={child.href}
													className={`px-4 py-2 rounded-lg transition-colors ${
														isChildActive
															? "text-primary-100 bg-primary-300"
															: "text-text-secondary hover:bg-gray-100"
													}`}
												>
													{child.label}
												</Link>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
					{auth?.userId && (
						<div className="flex flex-col gap-6 mt-4">
							<p className="font-medium">My Account </p>
							<div className="flex items-center gap-3">
								<img
									src={auth?.avatar || DefaultAvatar}
									alt="avatar"
									className="w-[60px] h-[60px] rounded-full"
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
