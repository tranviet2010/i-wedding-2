import { Badge, Box, Button, IconButton, Spinner, Table } from "@chakra-ui/react";
import { FiPlus, FiEdit, FiTrash, FiExternalLink } from "react-icons/fi";
import { useGetTemplates, useDeleteTemplate, Template } from "@/features/template/templateAPI";
import { useNavigate } from "react-router-dom";
import ModalCreateTemplate from "@/components/template/ModalCreateTemplate";
import ModalEditTemplate from "@/components/template/ModalEditTemplate";
import { useState } from "react";

const Home = () => {
	const { data: templates, isLoading } = useGetTemplates();
	const { mutate: deleteTemplate } = useDeleteTemplate();
	const navigate = useNavigate();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

	const handleEditTemplate = (template: Template) => {
		setEditingTemplate(template);
		setIsEditModalOpen(true);
	};

	const handleOpenEditor = (id: number) => {
		navigate(`/editor/${id}`);
	};

	const handleDeleteTemplate = (id: number) => {
		if (window.confirm("Bạn có chắc chắn muốn xóa template này?")) {
			deleteTemplate(id);
		}
	};

	return (
		<div className="text-black flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<p className="text-2xl font-bold">Quản lý Template</p>
				<ModalCreateTemplate open={isModalOpen} setOpen={setIsModalOpen}>
					<Button onClick={() => setIsModalOpen(true)}>
						<div className="flex items-center gap-2">
							<FiPlus />
							<p>Tạo Template</p>
						</div>
					</Button>
				</ModalCreateTemplate>
			</div>

			{isLoading ? (
				<Box display="flex" justifyContent="center" py={8}>
					<Spinner />
				</Box>
			) : templates && templates.length > 0 ? (
				<Table.Root >
					<Table.Header>
						<Table.Row>
							<Table.ColumnHeader>Tên</Table.ColumnHeader>
							<Table.ColumnHeader>Danh mục</Table.ColumnHeader>
							<Table.ColumnHeader>Tier</Table.ColumnHeader>
							<Table.ColumnHeader>Trạng thái</Table.ColumnHeader>
							<Table.ColumnHeader textAlign="right">Thao tác</Table.ColumnHeader>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{templates.map((template) => (
							<Table.Row key={template.id}>
								<Table.Cell>{template.name}</Table.Cell>
								<Table.Cell>{template.category || "—"}</Table.Cell>
								<Table.Cell>
									{template.tier && (
										<Badge colorScheme={template.tier === "free" ? "green" : template.tier === "pro" ? "purple" : "orange"}>
											{template.tier.toUpperCase()}
										</Badge>
									)}
								</Table.Cell>
								<Table.Cell>
									<Badge colorScheme={template.isActive ? "green" : "red"}>
										{template.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
									</Badge>
								</Table.Cell>
								<Table.Cell textAlign="right">
									<IconButton
										aria-label="Edit template"
										size="sm"
										mr={2}
										onClick={() => handleEditTemplate(template)}
									>
										<FiEdit />
									</IconButton>
									<IconButton
										aria-label="Open in editor"
										size="sm"
										mr={2}
										colorScheme="blue"
										onClick={() => handleOpenEditor(template.id!)}
									>
										<FiExternalLink />
									</IconButton>
									<IconButton
										aria-label="Delete template"
										size="sm"
										colorScheme="red"
										onClick={() => handleDeleteTemplate(template.id!)}
									>
										<FiTrash />
									</IconButton>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			) : (
				<Box textAlign="center" py={8}>
					Chưa có template nào. Nhấn "Tạo Template" để bắt đầu.
				</Box>
			)}

			{/* Edit Modal */}
			<ModalEditTemplate
				open={isEditModalOpen}
				setOpen={setIsEditModalOpen}
				template={editingTemplate}
			/>
		</div>
	);
};

export default Home;
