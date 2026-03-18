import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentProfessional() {
  const session = await getSession();
  if (!session?.user) return null;
  const id = (session.user as { id?: string }).id;
  if (!id) return null;
  return { id, email: session.user.email ?? "", name: session.user.name ?? "" };
}
