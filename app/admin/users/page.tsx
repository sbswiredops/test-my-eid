"use client";

import { useState } from "react";
import useSWR from "swr";
import { usersService } from "@/lib/api/users";
import type { User } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
	const { data: usersData, mutate: mutateUsers, isLoading } = useSWR("/users", async () => {
		const res = await usersService.getAll();
		return res?.data || [];
	});
	const usersList = Array.isArray(usersData) ? usersData : [];

	const [search, setSearch] = useState("");

	const filtered = usersList.filter((u: User) => {
		return (
			u.name?.toLowerCase().includes(search.toLowerCase()) ||
			u.email?.toLowerCase().includes(search.toLowerCase())
		);
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-serif text-2xl font-bold text-foreground">Users</h1>
					<p className="text-sm text-muted-foreground">Manage users ({usersList.length} users)</p>
				</div>
			</div>

			{/* Search */}
			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search users..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Users Table */}
			<Card>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left">
									<th className="p-4 font-medium text-muted-foreground">Name</th>
									<th className="p-4 font-medium text-muted-foreground">Email</th>
									<th className="p-4 font-medium text-muted-foreground">Role</th>
									<th className="p-4 font-medium text-muted-foreground">Status</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((user: User) => (
									<tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
										<td className="p-4">
											<span className="font-medium text-foreground">{user.name}</span>
										</td>
										<td className="p-4">
											<span className="text-muted-foreground">{user.email}</span>
										</td>
										<td className="p-4">
											<span className="text-muted-foreground">{user.role || "user"}</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{filtered.length === 0 && (
						<p className="py-12 text-center text-sm text-muted-foreground">No users found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
