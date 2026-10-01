"use server";

import { requireUser } from "@/features/auth/actions/require-user";
import { db } from "@/prisma/db";

/**
 * Server action that creates a new conversation titled "New Chat".
 *
 * @returns The ID of the newly created conversation.
 */
export async function startNewChat() {
    const user = await requireUser();

    const conversation = await db.orm.public.Conversation.create({
        userId: user.id,
        title: "New Chat",
    });

    return conversation.id;
}