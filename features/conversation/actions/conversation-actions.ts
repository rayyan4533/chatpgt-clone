"use server";


import { requireUser } from "@/features/auth/actions/require-user";
import { db } from "@/prisma/db";

export async function createConversation() {
    const user = await requireUser();

    const conversation =
        await db.orm.public.Conversation.create({
            title: "New Chat",
            userId: user!.id,
        });

    return conversation;
}