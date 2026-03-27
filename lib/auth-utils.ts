import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { connectDB } from "./db";
import User from "./models/User";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  await connectDB();

  const user = await User.findById((session.user as any).id);
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireRole(role: string | string[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}
