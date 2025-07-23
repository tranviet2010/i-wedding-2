import { Badge, Box, Button, IconButton, Spinner, Table } from "@chakra-ui/react";
import { FiEye, FiEdit, FiPlus } from "react-icons/fi";
import { useGetPages } from "@/features/page/pageAPI";
import { useNavigate } from "react-router-dom";

const Pages = () => {
	const { data: pages, isLoading } = useGetPages();
	const navigate = useNavigate();

	const handleViewPage = (id: number) => {
		navigate(`/page/view/${id}`);
	};

	const handleEditPage = (id: number) => {
		navigate(`/page/editor/${id}`);
	};

	return (
		<div className="text-black flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<p className="text-2xl font-bold">Pages</p>
			</div>

			{isLoading ? (
				<Box display="flex" justifyContent="center" py={8}>
					<Spinner />
				</Box>
			) : pages && pages.length > 0 ? (
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.ColumnHeader>Title</Table.ColumnHeader>
							<Table.ColumnHeader>Status</Table.ColumnHeader>
							<Table.ColumnHeader>Created</Table.ColumnHeader>
							<Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{pages.map((page) => (
							<Table.Row key={page.id}>
								<Table.Cell>{page.title}</Table.Cell>
								<Table.Cell>
									<Badge colorScheme={page.status === "published" ? "green" : "yellow"}>
										{page.status.toUpperCase()}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{new Date(page.createdAt).toLocaleDateString()}
								</Table.Cell>
								<Table.Cell textAlign="right">
									<IconButton
										aria-label="View page"
										size="sm"
										mr={2}
										onClick={() => handleViewPage(page.id)}
									>
										<FiEye />
									</IconButton>
									<IconButton
										aria-label="Edit page"
										size="sm"
										mr={2}
										onClick={() => handleEditPage(page.id)}
									>
										<FiEdit />
									</IconButton>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			) : (
				<Box textAlign="center" py={8}>
					No pages found.
				</Box>
			)}
		</div>
	);
};

export default Pages; 