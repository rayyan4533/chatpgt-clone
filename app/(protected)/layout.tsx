import { onboardUser } from "@/features/auth/actions/onboard";
import { auth } from "@clerk/nextjs/server";


export default async function AuthenticatedLayout({ children }: { children: React.ReactNode; }) {
    await auth.protect()
    await onboardUser();
    return (
        <>
            {children}
        </>



    )
}


