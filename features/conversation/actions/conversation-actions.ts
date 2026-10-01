"use server";

import { requireUser } from "@/features/auth/actions/require-user";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

/** Shape of a conversation row returned in the sidebar list. */
export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
};

/**
 * Verifies that a conversation exists and belongs to the given user.
 *
 * @throws {Error} When the conversation is not found or not owned by the user.
 */
async function assertOwnsConversation(conversationId: string, userId: number) {
    const conversation = await db.orm.public.Conversation
        .where({
            id: conversationId,
            userId,
        })
        .first();

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return conversation;
}

/**
 * Fetches a single conversation owned by the current user.
 *
 * @param conversationId - The conversation to load.
 * @throws {Error} When the conversation is not found.
 */
export async function getConversation(conversationId: string) {
    const user = await requireUser();
    return assertOwnsConversation(conversationId, user.id);
}

/**
 * Lists non-archived conversations for the current user.
 * Pinned conversations appear first, then sorted by most recent activity.
 */
export async function listConversations(): Promise<ConversationListItem[]> {
    const user = await requireUser();

    const conversations = await db.orm.public.Conversation
        .where({ userId: user.id, isArchived: false })
        .orderBy((c) => c.lastMessageAt.desc())
        .select(
            "id",
            "title",
            "isPinned",
            "isArchived",
            "lastMessageAt",
            "createdAt",
            "updatedAt"
        )
        .all();

    return conversations.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
}

/**
 * Creates a new conversation for the current user.
 *
 * @param title - Optional title; defaults to "New Chat".
 */
export async function createConversation(title = "New Chat") {
    const user = await requireUser();

    return await db.orm.public.Conversation.create({
        userId: user.id,
        title: title.trim() || "New Chat",
    });
}

/**
 * Updates conversation metadata (title, pin, or archive status).
 *
 * @param conversationId - The conversation to update.
 * @param data - Fields to change; omitted fields are left unchanged.
 */
export async function updateConversation(
    conversationId: string,
    data: { title?: string; isPinned?: boolean; isArchived?: boolean }
) {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    const updateData: { title?: string; isPinned?: boolean; isArchived?: boolean } = {};
    if (data.title !== undefined) updateData.title = data.title.trim() || "New Chat";
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;

    const conversation = await db.orm.public.Conversation
        .where({ id: conversationId })
        .update(updateData);

    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return conversation;
}

/**
 * Permanently deletes a conversation owned by the current user.
 *
 * @param conversationId - The conversation to delete.
 * @returns The deleted conversation ID.
 */
export async function deleteConversation(conversationId: string) {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    await db.orm.public.Conversation
        .where({ id: conversationId })
        .delete();

    revalidatePath("/");
    return { id: conversationId };
}