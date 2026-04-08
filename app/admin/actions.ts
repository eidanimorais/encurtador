"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateSlug, isValidSlug, normalizeSlug } from "@/lib/slug";

const urlSchema = z.url({ protocol: /^https?$/ });

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Não autenticado.");
  }

  return userId;
}

async function resolveUniqueSlug(baseSlug?: string) {
  if (baseSlug) {
    const slug = normalizeSlug(baseSlug);
    if (!isValidSlug(slug)) {
      throw new Error("Slug inválido. Use 3-64 caracteres (a-z, A-Z, 0-9, _, -). ");
    }

    const existing = await prisma.link.findUnique({ where: { slug } });
    if (existing) {
      throw new Error("Esse slug já está em uso.");
    }

    return slug;
  }

  for (let i = 0; i < 10; i += 1) {
    const generated = generateSlug();
    const existing = await prisma.link.findUnique({ where: { slug: generated } });
    if (!existing) {
      return generated;
    }
  }

  throw new Error("Não foi possível gerar um slug único. Tente novamente.");
}

export async function createLinkAction(formData: FormData) {
  const userId = await requireUserId();
  const destinationUrl = String(formData.get("destinationUrl") ?? "").trim();
  const customSlug = String(formData.get("customSlug") ?? "").trim();

  const parsedUrl = urlSchema.safeParse(destinationUrl);
  if (!parsedUrl.success) {
    throw new Error("Informe uma URL válida começando com http:// ou https://");
  }

  const slug = await resolveUniqueSlug(customSlug || undefined);

  await prisma.link.create({
    data: {
      slug,
      destinationUrl: parsedUrl.data,
      createdById: userId,
    },
  });

  revalidatePath("/admin");
}

export async function updateLinkAction(formData: FormData) {
  const userId = await requireUserId();
  const linkId = String(formData.get("linkId") ?? "").trim();
  const destinationUrl = String(formData.get("destinationUrl") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!linkId) {
    throw new Error("Link inválido.");
  }

  const parsedUrl = urlSchema.safeParse(destinationUrl);
  if (!parsedUrl.success) {
    throw new Error("Informe uma URL válida começando com http:// ou https://");
  }

  const current = await prisma.link.findUnique({ where: { id: linkId } });
  if (!current) {
    throw new Error("Link não encontrado.");
  }

  const nextSlug = normalizeSlug(slugInput);
  if (!isValidSlug(nextSlug)) {
    throw new Error("Slug inválido. Use 3-64 caracteres (a-z, A-Z, 0-9, _, -). ");
  }

  if (nextSlug !== current.slug) {
    const slugOwner = await prisma.link.findUnique({ where: { slug: nextSlug } });
    if (slugOwner && slugOwner.id !== current.id) {
      throw new Error("Esse slug já está em uso.");
    }
  }

  const destinationChanged = current.destinationUrl !== parsedUrl.data;

  await prisma.link.update({
    where: { id: current.id },
    data: {
      slug: nextSlug,
      destinationUrl: parsedUrl.data,
    },
  });

  if (destinationChanged) {
    await prisma.linkHistory.create({
      data: {
        linkId: current.id,
        changedById: userId,
        oldDestinationUrl: current.destinationUrl,
        newDestinationUrl: parsedUrl.data,
      },
    });
  }

  revalidatePath("/admin");
}
