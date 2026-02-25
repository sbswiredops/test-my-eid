"use client";

import { useEffect, useState } from "react";
import { faqService } from "@/lib/api/faq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminFAQs() {
	const [faqs, setFaqs] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [type, setType] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingFaq, setEditingFaq] = useState<any | null>(null);
	const [form, setForm] = useState({
		question: "",
		answer: "",
		type: "GENERAL",
		status: "ACTIVE",
		tags: "",
	});

	useEffect(() => {
		fetchFaqs();
	}, []);

	const fetchFaqs = () => {
		setLoading(true);
		faqService.getAll()
			.then(res => {
				if (res.success && Array.isArray(res.data)) {
					setFaqs(res.data);
				} else {
					toast.error("Failed to load FAQs");
				}
			})
			.catch(() => toast.error("Failed to load FAQs"))
			.finally(() => setLoading(false));
	};

	const handleDialogOpen = (faq?: any) => {
		if (faq) {
			setEditingFaq(faq);
			setForm({
				question: faq.question,
				answer: faq.answer,
				type: faq.type,
				status: faq.status,
				tags: faq.tags || "",
			});
		} else {
			setEditingFaq(null);
			setForm({ question: "", answer: "", type: "GENERAL", status: "ACTIVE", tags: "" });
		}
		setDialogOpen(true);
	};

	const handleSave = async () => {
		if (!form.question || !form.answer) {
			toast.error("Question and answer are required");
			return;
		}
		try {
			if (editingFaq) {
				await faqService.update(editingFaq.id, form);
				toast.success("FAQ updated");
			} else {
				await faqService.create(form);
				toast.success("FAQ created");
			}
			setDialogOpen(false);
			fetchFaqs();
		} catch {
			toast.error("Failed to save FAQ");
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm("Delete this FAQ?")) return;
		try {
			await faqService.delete(id);
			toast.success("FAQ deleted");
			fetchFaqs();
		} catch {
			toast.error("Failed to delete FAQ");
		}
	};

	const filteredFaqs = faqs.filter(faq => {
		const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase());
		const matchesType = type ? faq.type === type : true;
		return matchesSearch && matchesType;
	});

	const faqTypes = [
		"GENERAL",
		"PRODUCT",
		"ORDER",
		"PAYMENT",
		"SHIPPING",
		"RETURN",
		"ACCOUNT",
	];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-serif text-2xl font-bold text-foreground">FAQs</h1>
					<p className="text-sm text-muted-foreground">Manage all FAQs</p>
				</div>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => handleDialogOpen()}>
							<Plus className="mr-2 h-4 w-4" /> Add FAQ
						</Button>
					</DialogTrigger>
					<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-4 pt-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="question">Question *</Label>
								<Input id="question" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="answer">Answer *</Label>
								<Textarea id="answer" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={4} />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="type">Type</Label>
								<select id="type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="border rounded px-2 py-1 text-sm">
									{faqTypes.map(t => <option key={t} value={t}>{t}</option>)}
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="status">Status</Label>
								<select id="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="border rounded px-2 py-1 text-sm">
									<option value="ACTIVE">ACTIVE</option>
									<option value="INACTIVE">INACTIVE</option>
									<option value="DRAFT">DRAFT</option>
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="tags">Tags (comma separated)</Label>
								<Input id="tags" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
							</div>
							<Button onClick={handleSave} className="w-full">{editingFaq ? "Update FAQ" : "Create FAQ"}</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search & Filter */}
			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input placeholder="Search FAQs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
				</div>
				<div className="flex items-center gap-2">
					<Label htmlFor="faq-type">Type:</Label>
					<select id="faq-type" value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1 text-sm">
						<option value="">All</option>
						{faqTypes.map(t => <option key={t} value={t}>{t}</option>)}
					</select>
				</div>
			</div>

			{/* FAQ List */}
			<div className="grid gap-4">
				{loading ? (
					<p className="text-center text-sm text-muted-foreground">Loading...</p>
				) : filteredFaqs.length === 0 ? (
					<p className="text-center text-sm text-muted-foreground">No FAQs found.</p>
				) : (
					filteredFaqs.map(faq => (
						<Card key={faq.id} className="border">
							<CardHeader>
								<CardTitle className="font-serif text-lg text-foreground">{faq.question}</CardTitle>
								<div className="flex items-center gap-2 mt-2">
									<Badge>{faq.type}</Badge>
									<Badge variant={faq.status === "ACTIVE" ? "default" : "outline"}>{faq.status}</Badge>
									{faq.tags && faq.tags.split(",").map((tag: string) => (
										<Badge key={tag} variant="secondary">{tag.trim()}</Badge>
									))}
									<Button variant="ghost" size="icon" onClick={() => handleDialogOpen(faq)} aria-label="Edit FAQ"><Pencil className="h-4 w-4" /></Button>
									<Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)} aria-label="Delete FAQ" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
								</div>
							</CardHeader>
							<CardContent>
								<div className="prose max-w-none text-sm text-muted-foreground">{faq.answer}</div>
								<div className="mt-4 flex flex-wrap gap-2">
									{faq.categories && faq.categories.length > 0 && (
										<span className="text-xs text-muted-foreground">Categories: {faq.categories.map((c: any) => c.name).join(", ")}</span>
									)}
									{faq.products && faq.products.length > 0 && (
										<span className="text-xs text-muted-foreground">Products: {faq.products.map((p: any) => p.name).join(", ")}</span>
									)}
								</div>
								<div className="mt-2 text-xs text-muted-foreground">
									Helpful: {faq.helpfulCount} | Not Helpful: {faq.notHelpfulCount} | Views: {faq.viewCount}
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
