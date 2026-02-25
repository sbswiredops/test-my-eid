"use client";

import { useState } from "react";
import useSWR from "swr";
import { cartService } from "@/lib/api/cart";
import type { CartItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminCart() {
	const { data: cartData, mutate: mutateCart, isLoading } = useSWR("/cart", async () => {
		const res = await cartService.getCart();
		return res?.data?.items || [];
	});
	const cartItems = Array.isArray(cartData) ? cartData : [];

	const [removing, setRemoving] = useState<string | null>(null);

	const handleRemove = async (productId: string, size: string) => {
		const key = `${productId}-${size}`;
		setRemoving(key);
		try {
			await cartService.removeItem(productId); // If API expects only productId
			mutateCart && mutateCart();
			toast.success("Item removed from cart");
		} catch (error) {
			toast.error("Failed to remove item");
		} finally {
			setRemoving(null);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-serif text-2xl font-bold text-foreground">Cart</h1>
					<p className="text-sm text-muted-foreground">Manage cart items ({cartItems.length} items)</p>
				</div>
			</div>

			{/* Cart Table */}
			<Card>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left">
									<th className="p-4 font-medium text-muted-foreground">Product</th>
									<th className="p-4 font-medium text-muted-foreground">Quantity</th>
									<th className="p-4 font-medium text-muted-foreground">Price</th>
									<th className="p-4 font-medium text-muted-foreground">Actions</th>
								</tr>
							</thead>
							<tbody>
								{cartItems.map((item: CartItem) => {
									const key = `${item.productId}-${item.size}`;
									return (
										<tr key={key} className="border-b last:border-0 hover:bg-muted/30">
											<td className="p-4">
												<span className="font-medium text-foreground">{item.name}</span>
											</td>
											<td className="p-4">
												<span className="text-muted-foreground">{item.quantity}</span>
											</td>
											<td className="p-4">
												<span className="text-muted-foreground">{item.price}</span>
											</td>
											<td className="p-4">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRemove(item.productId, item.size)}
													disabled={removing === key}
													className="text-destructive hover:text-destructive"
												>
													{removing === key ? "Removing..." : "Remove"}
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					{cartItems.length === 0 && (
						<p className="py-12 text-center text-sm text-muted-foreground">No items in cart.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
