"use server";

/* eslint-disable consistent-return */
import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	amount: z.coerce.number(),
	status: z.enum(["pending", "paid"]),
	date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const EditInvoice = FormSchema.omit({ id: true, date: true });

type ReturnType = void | { message: string };

export const createInvoice = async (
	formData: FormData,
): Promise<ReturnType> => {
	const { customerId, amount, status } = CreateInvoice.parse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	const amountInCents = amount * 100;
	const date = new Date().toISOString().split("T")[0];

	try {
		await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
	} catch (error) {
		return {
			message: "Database Error: Failed to Create Invoice.",
		};
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
};

export const editInvoice = async (
	id: string,
	formData: FormData,
): Promise<ReturnType> => {
	const { customerId, amount, status } = EditInvoice.parse({
		customerId: formData.get("customerId"),
		amount: formData.get("amount"),
		status: formData.get("status"),
	});

	const amountInCents = amount * 100;
	try {
		await sql`
      UPDATE invoices
      SET customer_id = ${customerId},
      amount = ${amountInCents},
      status = ${status}
      WHERE id = ${id};
    `;
	} catch (error) {
		return {
			message: "Database Error: Failed to Edit Invoice.",
		};
	}

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
};

export const deleteInvoice = async (id: string) => {
	try {
		await sql`
      Delete FROM invoices WHERE id = ${id};
    `;

		revalidatePath("/dashboard/invoices");
		return { message: "Deleted Invoice." };
	} catch (error) {
		return {
			message: "Database Error: Failed to Delete Invoice.",
		};
	}
};
