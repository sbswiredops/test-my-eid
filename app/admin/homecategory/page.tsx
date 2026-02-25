"use client";

import { useState } from "react";
import { useCategories, useProducts } from "@/hooks/use-api";
import { homeCategoryService } from "@/lib/api/homecategory";
import useSWR from "swr";
import type { Category, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const HomeCategoryPage = () => {
	const { data: homeCategoriesData, mutate: mutateHomeCategories, isLoading: loadingHomeCategories } = useSWR("/homecategory", async () => {
		const res = await homeCategoryService.getAll();
		return res?.data || [];
	});
	const { data: categoriesData } = useCategories();
	const { data: productsData } = useProducts();
	const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];
	const productsList = Array.isArray(productsData) ? productsData : [];
	const homeCategoriesList = Array.isArray(homeCategoriesData) ? homeCategoriesData : [];

	const [search, setSearch] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingHomeCategory, setEditingHomeCategory] = useState<any | null>(null);
	const [loading, setLoading] = useState(false);

	// Form state
	const [form, setForm] = useState({
		name: "",
		priority: "",
		categories: [] as string[],
		products: [] as string[],
		description: "",
	});

	const resetForm = () => {
		setForm({ name: "", priority: "", categories: [], products: [], description: "" });
		setEditingHomeCategory(null);
	};

	const openEdit = (homeCategory: any) => {
		setEditingHomeCategory(homeCategory);
		setForm({
			name: homeCategory.name,
			priority: homeCategory.priority?.toString() || "",
			categories: homeCategory.categories?.map((c: Category) => c.id) || [],
			products: homeCategory.products?.map((p: Product) => p.id) || [],
			description: homeCategory.description || "",
		});
		setDialogOpen(true);
	};

	const handleSave = async () => {
		if (!form.name) {
			toast.error("Please fill in required fields");
			return;
		}
		setLoading(true);
		try {
			const data: Record<string, any> = {
				name: form.name,
				priority: form.priority ? Number(form.priority) : undefined,
				categories: form.categories,
				products: form.products,
				description: form.description,
			};
			if (editingHomeCategory) {
				await homeCategoryService.update(editingHomeCategory.id, data);
				toast.success("HomeCategory updated successfully");
			} else {
				await homeCategoryService.create(data);
				toast.success("HomeCategory created successfully");
			}
			mutateHomeCategories && mutateHomeCategories();
			setDialogOpen(false);
			resetForm();
		} catch (error) {
			toast.error("Failed to save homecategory");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await homeCategoryService.delete(id);
			mutateHomeCategories && mutateHomeCategories();
			toast.success("HomeCategory deleted");
		} catch (error) {
			toast.error("Failed to delete homecategory");
		}
	};

	const filtered = homeCategoriesList.filter((c: any) => {
		return c.name.toLowerCase().includes(search.toLowerCase());
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-serif text-2xl font-bold text-foreground">Home Categories</h1>
					<p className="text-sm text-muted-foreground">Manage your home categories ({homeCategoriesList.length} items)</p>
				</div>
				<Dialog
					open={dialogOpen}
					onOpenChange={(open) => {
						setDialogOpen(open);
						if (!open) resetForm();
					}}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add HomeCategory
						</Button>
					</DialogTrigger>
					<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
						<DialogHeader>
							<DialogTitle className="font-serif">
								{editingHomeCategory ? "Edit HomeCategory" : "Add New HomeCategory"}
							</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-4 pt-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
									placeholder="HomeCategory name"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="priority">Priority</Label>
								<Input
									id="priority"
									type="number"
									value={form.priority}
									onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
									placeholder="1"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="categories">Categories</Label>
								<select
									id="categories"
									multiple
									value={form.categories}
									onChange={(e) => {
										const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
										setForm((f) => ({ ...f, categories: selected }));
									}}
									className="border rounded p-2"
								>
									{categoriesList.map((cat: Category) => (
										<option key={cat.id} value={cat.id}>{cat.name}</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="products">Products</Label>
								<select
									id="products"
									multiple
									value={form.products}
									onChange={(e) => {
										const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
										setForm((f) => ({ ...f, products: selected }));
									}}
									className="border rounded p-2"
								>
									{productsList.map((prod: Product) => (
										<option key={prod.id} value={prod.id}>{prod.name}</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={form.description}
									onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
									placeholder="HomeCategory description"
									rows={3}
								/>
							</div>
							<Button
								onClick={handleSave}
								className="w-full"
								disabled={loading}
							>
								{loading
									? "Saving..."
									: editingHomeCategory
										? "Update HomeCategory"
										: "Create HomeCategory"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search */}
			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search homecategories..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* HomeCategories Table */}
			<Card>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left">
									<th className="p-4 font-medium text-muted-foreground">Name</th>
									<th className="p-4 font-medium text-muted-foreground">Priority</th>
									<th className="p-4 font-medium text-muted-foreground">Categories</th>
									<th className="p-4 font-medium text-muted-foreground">Products</th>
									<th className="p-4 font-medium text-muted-foreground">Actions</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((homeCategory: any) => (
									<tr key={homeCategory.id} className="border-b last:border-0 hover:bg-muted/30">
										<td className="p-4">
											<span className="font-medium text-foreground">{homeCategory.name}</span>
										</td>
										<td className="p-4">
											<span className="text-muted-foreground">{homeCategory.priority}</span>
										</td>
										<td className="p-4">
											<span className="text-muted-foreground">
												{(homeCategory.categories || []).map((c: Category) => c.name).join(", ")}
											</span>
										</td>
										<td className="p-4">
											<span className="text-muted-foreground">
												{(homeCategory.products || []).map((p: Product) => p.name).join(", ")}
											</span>
										</td>
										<td className="p-4">
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openEdit(homeCategory)}
													aria-label={`Edit ${homeCategory.name}`}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDelete(homeCategory.id)}
													aria-label={`Delete ${homeCategory.name}`}
													className="text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{filtered.length === 0 && (
						<p className="py-12 text-center text-sm text-muted-foreground">No homecategories found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default HomeCategoryPage;

