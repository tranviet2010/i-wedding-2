import { CreateTemplate, useCreateTemplate } from "@/features/template/templateAPI";
import { Button, DialogBody, DialogRoot, DialogTrigger, HStack, Input, NativeSelect, Portal, Switch, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { CloseButton } from "../ui/close-button";
import { DialogActionTrigger, DialogBackdrop, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field } from "../ui/field";

export default function ModalCreateTemplate({ open, setOpen, children }: { open: boolean, setOpen: (open: boolean) => void, children: React.ReactNode }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [tier, setTier] = useState<'free' | 'pro' | 'vip'>('free');
    const [category, setCategory] = useState<'wedding' | 'birthday' | 'baby'>('wedding');
    const [isActive, setIsActive] = useState(true);

    const { mutate: createTemplate, isPending } = useCreateTemplate();

    const handleSubmit = () => {
        const templateData: CreateTemplate = {
            name,
            description,
            imageUrl,
            tier,
            category,
            isActive,
        };
        createTemplate(templateData, {
            onSuccess: () => {
                setOpen(false);
                // Reset form
                setName("");
                setDescription("");
                setImageUrl("");
                setTier('free');
                setCategory('wedding');
                setIsActive(true);
            }
        });
    };

    return (
        <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <Portal>
                <DialogBackdrop style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}/>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Template</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <VStack gap={4} align="stretch">
                            <Field label="Name" required>
                                <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Template Name" />
                            </Field>
                            <Field label="Description">
                                <Input value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} placeholder="Template Description" />
                            </Field>
                            <Field label="Image URL" required>
                                <Input value={imageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
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
                                    <NativeSelect.Field placeholder="Select option" value={category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as 'wedding' | 'birthday' | 'baby')}>
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
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        </DialogActionTrigger>
                        <Button onClick={handleSubmit} disabled={isPending} colorScheme="blue">Save</Button>
                    </DialogFooter>
                    <DialogCloseTrigger asChild>
                        <CloseButton size="sm" />
                    </DialogCloseTrigger>
                </DialogContent>
            </Portal>
        </DialogRoot>
    )
}