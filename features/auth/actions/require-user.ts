"use server"

import { db } from "@/prisma/db"
import { auth, currentUser } from "@clerk/nextjs/server"


export async function requireUser() {


    const { userId } = await auth.protect()
    const user = await db.orm.public.User
        .where({
            clerkId: userId
        }).first()

    if (!user) throw new Error("User not found")

    return user
}



