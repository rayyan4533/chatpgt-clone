import { 
    convertToModelMessages, 
    createUIMessageStreamResponse, 
    streamText, 
    toUIMessageStream, 
    type UIMessage 
} from "ai";
import { requireUser } from "@/features/auth/actions/require-user";
import { getChatModel } from "@/features/ai/utils/model";
import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { db } from "@/prisma/db";

export async function POST(req: Request) {
    try {
        const user = await requireUser();

        const body = await req.json();
        const conversationId: string = body.id || body.conversationId;
        const message: UIMessage | undefined = body.message;
        const messages: UIMessage[] | undefined = body.messages;

        if (!conversationId) {
            return new Response("Conversation ID is required", { status: 400 });
        }

        // Verify conversation ownership with Prisma 8
        const conversation = await db.orm.public.Conversation
            .where({ id: conversationId, userId: user.id })
            .first();

        if (!conversation) {
            return new Response("Conversation not found", { status: 404 });
        }

        const previousMessages = await loadChatMessages(conversationId);

        let allMessages: UIMessage[];
        if (messages && Array.isArray(messages) && messages.length > 0) {
            allMessages = messages;
        } else if (message) {
            const alreadyExists = previousMessages.some((m) => m.id === message.id);
            allMessages = alreadyExists ? previousMessages : [...previousMessages, message];
        } else {
            allMessages = previousMessages;
        }

        const modelMessages = await convertToModelMessages(allMessages);
        const model = getChatModel(conversation.model);

        const result = streamText({
            model,
            system: conversation.systemPrompt || "You are a helpful AI assistant.",
            messages: modelMessages,
        });

        // Keeps generation alive on server even if client disconnects
        result.consumeStream();

        return createUIMessageStreamResponse({
            stream: toUIMessageStream({
                stream: result.stream,
                originalMessages: allMessages,
                onEnd: async ({ messages: finalMessages }) => {
                    await saveChatMessages(conversationId, finalMessages);
                },
            }),
        });
    } catch (error) {
        console.error("Error in /api/chat route:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}