import { PrismaService } from '../src/prisma/prisma.service';

export const TEST_RUN_ID =
  process.env.TEST_RUN_ID || (process.env.JEST_WORKER_ID ? `jest-worker-${process.env.JEST_WORKER_ID}` : 'local');

export const uniqueEmail = (prefix: string) => `${prefix}-${TEST_RUN_ID}@example.com`;
export const uniqueName = (prefix: string) => `${prefix}-${TEST_RUN_ID}`;
export const uniqueSlug = (slug: string) => `${slug}-${TEST_RUN_ID}`;
export const uniqueTitle = (title: string) => `${title}-${TEST_RUN_ID}`;
export const uniqueText = (text: string) => `${text} ${TEST_RUN_ID}`;

export const authEmail = () => uniqueEmail('auth');
export const authPassword = 'testpass123';

export async function cleanTestData(prisma: PrismaService) {
  const runId = TEST_RUN_ID;

  await prisma.tenantAdmin
    .deleteMany({
      where: {
        OR: [{ tenant: { slug: { contains: runId } } }, { user: { email: { contains: runId } } }],
      },
    })
    .catch(() => {
      // Ignore errors if no matching tenant admins exist
    });

  await prisma.post
    .deleteMany({
      where: { title: { contains: runId } },
    })
    .catch(() => {
      // Ignore errors if no matching posts exist
    });

  await prisma.tenant
    .deleteMany({
      where: {
        OR: [{ slug: { contains: runId } }, { name: { contains: runId } }],
      },
    })
    .catch(() => {
      // Ignore errors if no matching tenants exist
    });

  await prisma.user
    .deleteMany({
      where: {
        OR: [{ email: { contains: runId } }, { name: { contains: runId } }],
      },
    })
    .catch(() => {
      // Ignore errors if no matching users exist
    });
}
