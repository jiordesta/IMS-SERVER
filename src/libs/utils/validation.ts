import { prisma } from '../db/client';
import { enumToArray } from './helper';

export async function isUsernameExist(username: string) {
  const user = await prisma.userCredential.findFirst({
    where: { username },
  });
  return user ? true : false;
}

export async function isRoleNameExist(name: string) {
  const role = await prisma.roleDetails.findFirst({ where: { name } });

  return role ? true : false;
}

export async function isUserAlreadyHaveRole(userId: number) {
  const userRole = await prisma.userRole.findFirst({ where: { userId } });

  return userRole ? true : false;
}

export async function isRoleIdValid(roleId: number) {
  if (!roleId) return false;

  const role = await prisma.role.findUnique({ where: { id: roleId } });

  return role ? true : false;
}

export async function isUserIdValid(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  return user ? true : false;
}

export function isRoleValid(roles: number[], user: any) {
  if (!user?.userRole?.roleId) return false;

  const isValid = roles.includes(user.role.roleId);

  return isValid;
}

export function isUserAuthorized(roles: number[], user: any) {
  if (!user?.userRole?.roleId) return false;

  const isValid = roles.includes(user.userRole.roleId);

  return isValid;
}
