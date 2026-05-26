import "dotenv/config";
import {
  CLINIC_PROVIDERS,
  DEMO_PROCEDURE_KITS,
  DEMO_TECHNICIAN,
  DEMO_USER,
  KIOSK_USER,
} from "@kittracker/shared";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/db/prisma";

const demoEmail = process.env.DEMO_USER_EMAIL ?? DEMO_USER.email;
const demoPassword = process.env.DEMO_USER_PASSWORD ?? DEMO_USER.password;
const demoName = process.env.DEMO_USER_NAME ?? DEMO_USER.name;

const kioskEmail = process.env.KIOSK_USER_EMAIL ?? KIOSK_USER.email;
const kioskPassword = process.env.KIOSK_PIN ?? KIOSK_USER.password;
const kioskName = process.env.KIOSK_USER_NAME ?? KIOSK_USER.displayName;

async function ensureDemoUser(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: demoEmail },
    select: { id: true },
  });

  if (existing) {
    await prisma.bin.deleteMany({ where: { userId: existing.id } });
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "lead",
        assignedProviders: [...CLINIC_PROVIDERS],
      },
    });
    console.log(`Reusing demo lead ${demoEmail}, refreshing procedure kits…`);
    return existing.id;
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: demoEmail,
      password: demoPassword,
      name: demoName,
    },
  });

  if (!result?.user?.id) {
    throw new Error("Demo sign-up did not return a user id");
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: {
      role: "lead",
      assignedProviders: [...CLINIC_PROVIDERS],
    },
  });

  console.log(`Created demo lead ${demoEmail}`);
  return result.user.id;
}

async function seedProcedureKits(userId: string): Promise<void> {
  for (const kit of DEMO_PROCEDURE_KITS) {
    await prisma.bin.create({
      data: {
        userId,
        name: kit.name,
        location: kit.location,
        description: kit.description,
        providerTags: kit.providerTags,
        items: {
          create: kit.items.map((item) => ({
            name: item.name,
            description: item.description,
          })),
        },
      },
    });
  }
}

async function ensureKioskUser(): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: kioskEmail },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "kiosk", assignedProviders: [] },
    });
    console.log(`Kiosk tablet user already exists (${kioskEmail}).`);
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: kioskEmail,
      password: kioskPassword,
      name: kioskName,
    },
  });

  if (!result?.user?.id) {
    throw new Error("Kiosk sign-up did not return a user id");
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "kiosk", assignedProviders: [] },
  });

  console.log(`Created kiosk tablet user ${kioskEmail}`);
}

async function ensureDemoTechnician(): Promise<void> {
  const email = process.env.DEMO_TECH_EMAIL ?? DEMO_TECHNICIAN.email;
  const password = process.env.DEMO_TECH_PASSWORD ?? DEMO_TECHNICIAN.password;
  const name = process.env.DEMO_TECH_NAME ?? DEMO_TECHNICIAN.name;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "technician",
        assignedProviders: [...DEMO_TECHNICIAN.assignedProviders],
      },
    });
    console.log(`Demo technician already exists (${email}).`);
    return;
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  if (!result?.user?.id) {
    throw new Error("Demo technician sign-up did not return a user id");
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: {
      role: "technician",
      assignedProviders: [...DEMO_TECHNICIAN.assignedProviders],
    },
  });

  console.log(`Created demo technician ${email} (team: ${DEMO_TECHNICIAN.assignedProviders.join(", ")})`);
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run the seed");
  }
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required to run the seed");
  }

  // Allow auth.api.signUpEmail() to work regardless of the REGISTRATION_ENABLED env var.
  // The seed runs as a standalone process, not as the web server, so this is safe.
  process.env.REGISTRATION_ENABLED = "true";

  const userId = await ensureDemoUser();
  await ensureKioskUser();
  await ensureDemoTechnician();
  await seedProcedureKits(userId);

  console.log(`Seeded ${DEMO_PROCEDURE_KITS.length} procedure kits (Dr. Eye → Dr. Eye8).`);
  console.log(`Demo lead: ${demoEmail} / ${demoPassword}`);
  console.log(
    `Demo technician (Dr. Eye team only): ${DEMO_TECHNICIAN.email} / ${DEMO_TECHNICIAN.password}`
  );
  console.log(`Clinic tablet (QR scan PIN): ${kioskName} / PIN ${kioskPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
