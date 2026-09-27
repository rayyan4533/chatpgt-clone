"use server"

import { db } from "@/prisma/db";
import { currentUser } from "@clerk/nextjs/server"



export async function onboardUser() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error("Unauthorized");
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
        throw new Error("No primary email found for Clerk user");
    }

    const user = await db.orm.public.User.upsert({
        create: {
            clerkId: clerkUser.id,
            email,
            name: clerkUser.firstName,
        },

        update: {
            email,
            name: clerkUser.firstName,
        },

        conflictOn: {
            clerkId: clerkUser.id,
        },
    });

    return user;
}