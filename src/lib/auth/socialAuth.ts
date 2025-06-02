import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface SocialProfile {
  id: string;
  provider: 'google' | 'facebook' | 'twitter';
  providerId: string;
  email: string;
  name: string;
  image?: string;
}

export async function linkSocialAccount(profile: SocialProfile) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  // Check if social account is already linked
  const existingLink = await prisma.socialAccount.findFirst({
    where: {
      provider: profile.provider,
      providerId: profile.providerId,
    },
  });

  if (existingLink) {
    throw new Error('Social account already linked');
  }

  // Link social account to user
  await prisma.socialAccount.create({
    data: {
      provider: profile.provider,
      providerId: profile.providerId,
      userId: session.user.id,
      email: profile.email,
      name: profile.name,
      image: profile.image,
    },
  });

  return true;
}

export async function unlinkSocialAccount(provider: SocialProfile['provider']) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  await prisma.socialAccount.deleteMany({
    where: {
      userId: session.user.id,
      provider,
    },
  });

  return true;
}

export async function getLinkedAccounts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Not authenticated');
  }

  return prisma.socialAccount.findMany({
    where: {
      userId: session.user.id,
    },
  });
} 