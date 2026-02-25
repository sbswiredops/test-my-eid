"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/use-api";
import { categoryService } from "@/lib/api/categories";
import type { Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AdminCategories() {
	const {
		data: categoriesData,
		mutate: mutateCategories,
		isLoading: loadingCategories,
	} = useCategories();
	const categoriesList = Array.isArray(categoriesData) ? categoriesData : [];

	const [search, setSearch] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [loading, setLoading] = useState(false);

	// Form state
	const [form, setForm] = useState({
		name: "",
		description: "",
		slug: "",
	});
	const [selectedImage, setSelectedImage] = useState<File | null>(null);

	const resetForm = () => {
		setForm({ name: "", description: "", slug: "" });
		setEditingCategory(null);
		setSelectedImage(null);
	};

	const openEdit = (category: Category) => {
		setEditingCategory(category);
		setForm({
			name: category.name,
			description: category.description || "",
			slug: category.slug,
		});
		setSelectedImage(null);
		setDialogOpen(true);
	};

	const handleSave = async () => {
		if (!form.name) {
			toast.error("Please fill in required fields");
			return;
		}
		setLoading(true);
		try {
			let data: FormData | Record<string, any>;
			if (selectedImage) {
				data = new FormData();
				data.append("name", form.name);
				data.append("description", form.description);
				data.append("image", selectedImage);
				if (editingCategory) data.append("slug", form.slug);
			} else {
				data = editingCategory
					? { name: form.name, description: form.description, slug: form.slug }
					: { name: form.name, description: form.description };
			}
			if (editingCategory) {
				await categoryService.update(editingCategory.id, data);
				toast.success("Category updated successfully");
			} else {
				await categoryService.create(data);
				toast.success("Category created successfully");
			}
			mutateCategories();
			setDialogOpen(false);
			resetForm();
		} catch (error) {
			toast.error("Failed to save category");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await categoryService.delete(id);
			mutateCategories();
			toast.success("Category deleted");
		} catch (error) {
			toast.error("Failed to delete category");
		}
	};

	const filtered = categoriesList.filter((c: Category) => {
		return c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase());
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-serif text-2xl font-bold text-foreground">Categories</h1>
					<p className="text-sm text-muted-foreground">Manage your categories ({categoriesList.length} categories)</p>
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
							Add Category
						</Button>
					</DialogTrigger>
					<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
						<DialogHeader>
							<DialogTitle className="font-serif">
								{editingCategory ? "Edit Category" : "Add New Category"}
							</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-4 pt-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
									placeholder="Category name"
								/>
							</div>
							{editingCategory && (
								<div className="flex flex-col gap-2">
									<Label htmlFor="slug">Slug</Label>
									<Input
										id="slug"
										value={form.slug}
										onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
										placeholder="category-slug"
									/>
								</div>
							)}
							<div className="flex flex-col gap-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={form.description}
									onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
									placeholder="Category description"
									rows={3}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="image">Image</Label>
								<Input
									id="image"
									type="file"
									accept="image/*"
									onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
								/>
								<p className="text-xs text-muted-foreground">Upload category image.</p>
							</div>
							<Button
								onClick={handleSave}
								className="w-full"
								disabled={loading}
							>
								{loading
									? "Saving..."
									: editingCategory
										? "Update Category"
										: "Create Category"}
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
						placeholder="Search categories..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Categories Table */}
			<Card>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left">
									<th className="p-4 font-medium text-muted-foreground">Image</th>
									<th className="p-4 font-medium text-muted-foreground">Name</th>
									<th className="p-4 font-medium text-muted-foreground">Slug</th>
									<th className="p-4 font-medium text-muted-foreground">Description</th>
									<th className="p-4 font-medium text-muted-foreground">Actions</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((category: Category) => (
									<tr key={category.id} className="border-b last:border-0 hover:bg-muted/30">
										<td className="p-4">
											{category.image ? (
												<img
													src={category.image}
													alt={category.name}
													className="h-12 w-12 object-cover rounded"
												/>
											) : (
												<span className="text-muted-foreground">No image</span>
											)}
										</td>
										<td className="p-4">
											<span className="font-medium text-foreground">{category.name}</span>
										</td>
										<td className="p-4">
											<span className="text-muted-foreground">{category.slug}</span>
										</td>
										<td className="p-4">
											<span className="text-muted-foreground">{category.description}</span>
										</td>
										<td className="p-4">
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openEdit(category)}
													aria-label={`Edit ${category.name}`}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDelete(category.id)}
													aria-label={`Delete ${category.name}`}
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
						<p className="py-12 text-center text-sm text-muted-foreground">No categories found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
