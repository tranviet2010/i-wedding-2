import { Template, useUpdateTemplate } from "@/features/template/templateAPI";
import { Button, DialogBody, DialogRoot, HStack, Input, NativeSelect, Portal, Switch, VStack, Box, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { CloseButton } from "../ui/close-button";
import { DialogActionTrigger, DialogBackdrop, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field } from "../ui/field";

interface ModalEditTemplateProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    template: Template | null;
}

export default function ModalEditTemplate({ open, setOpen, template }: ModalEditTemplateProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [tier, setTier] = useState<'free' | 'pro' | 'vip'>('free');
    const [category, setCategory] = useState<'wedding' | 'birthday' | 'baby'>('wedding');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState<string>('');

    const { mutate: updateTemplate, isPending } = useUpdateTemplate();

    // Initialize form with template data when template changes
    useEffect(() => {
        if (template) {
            setName(template.name || "");
            setDescription(template.description || "");
            setImageUrl(template.previewUrl || "");
            setTier(template.tier || 'free');
            setCategory(template.category || 'wedding');
            setIsActive(template.isActive ?? true);
            setError('');
        }
    }, [template]);

    const handleClose = () => {
        setOpen(false);
        setError('');
    };

    const handleSubmit = () => {
        // Basic validation
        if (!name.trim()) {
            setError('Vui lòng nhập tên template');
            return;
        }
        if (!imageUrl.trim()) {
            setError('Vui lòng nhập URL hình ảnh');
            return;
        }

        if (!template?.id) {
            setError('Không tìm thấy template để cập nhật');
            return;
        }

        setError('');

        const updateData = {
            name: name.trim(),
            description: description.trim(),
            previewUrl: imageUrl.trim(),
            tier,
            category,
            isActive,
        };

        updateTemplate(
            { id: template.id, data: updateData },
            {
                onSuccess: () => {
                    handleClose();
                },
                onError: (error) => {
                    console.error('Error updating template:', error);
                    setError('Có lỗi xảy ra khi cập nhật template. Vui lòng thử lại.');
                }
            }
        );
    };

    return (
        <DialogRoot lazyMount open={open} onOpenChange={(e) => e.open ? null : handleClose()}>
            <Portal>
                <DialogBackdrop style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}/>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa Template</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <VStack gap={4} align="stretch">
                            {error && (
                                <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md">
                                    <Text color="red.600" fontSize="sm">
                                        {error}
                                    </Text>
                                </Box>
                            )}
                            <Field label="Name" required>
                                <Input 
                                    value={name} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                                    placeholder="Template Name"
                                    disabled={isPending}
                                />
                            </Field>
                            <Field label="Description">
                                <Input 
                                    value={description} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} 
                                    placeholder="Template Description"
                                    disabled={isPending}
                                />
                            </Field>
                            <Field label="Image URL" required>
                                <Input 
                                    value={imageUrl} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)} 
                                    placeholder="https://example.com/image.png"
                                    disabled={isPending}
                                />
                            </Field>
                            <Field label="Tier" required>
                                <NativeSelect.Root size="sm" width="100%">
                                    <NativeSelect.Field
                                        placeholder="Select option"
                                        value={tier}
                                        onChange={(e) => setTier(e.currentTarget.value as 'free' | 'pro' | 'vip')}
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="vip">VIP</option>
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>
                            </Field>
                            <Field label="Category" required>
                                <NativeSelect.Root size="sm" width="100%">
                                    <NativeSelect.Field 
                                        placeholder="Select option" 
                                        value={category} 
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as 'wedding' | 'birthday' | 'baby')}
                                    >
                                        <option value="wedding">Wedding</option>
                                        <option value="birthday">Birthday</option>
                                        <option value="baby">Baby</option>
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>
                            </Field>
                            <HStack justifyContent="space-between" w="full" alignItems="center">
                                <Field label="Active" />
                                <Switch.Root
                                    checked={isActive}
                                    onCheckedChange={(e) => setIsActive(e.checked)}
                                    id="isActive-switch"
                                    disabled={isPending}
                                >
                                    <Switch.HiddenInput />
                                    <Switch.Control>
                                        <Switch.Thumb />
                                    </Switch.Control>
                                </Switch.Root>
                            </HStack>
                        </VStack>
                    </DialogBody>
                    <DialogFooter>
                        <DialogActionTrigger asChild>
                            <Button variant="outline" onClick={handleClose} disabled={isPending}>
                                Hủy
                            </Button>
                        </DialogActionTrigger>
                        <Button onClick={handleSubmit} disabled={isPending} colorScheme="blue">
                            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                    <DialogCloseTrigger asChild>
                        <CloseButton size="sm" />
                    </DialogCloseTrigger>
                </DialogContent>
            </Portal>
        </DialogRoot>
    )
}
