import { fetchFilteredCustomers } from "@/app/lib/data";
import Table from "@/app/ui/customers/table";

export default async function Page({
	searchParams,
}: {
	searchParams?: {
		query?: string;
	};
}) {
	const query = searchParams?.query || "";
	const filteredCustomers = await fetchFilteredCustomers(query);

	return <Table customers={filteredCustomers} />;
}
