import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIp, parseUserAgent } from "@/lib/analytics";

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const link = await prisma.link.findUnique({ where: { slug } });

  if (!link || !link.isActive) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");
  const country = request.headers.get("x-vercel-ip-country");
  const city = request.headers.get("x-vercel-ip-city");
  const parsedUa = parseUserAgent(userAgent);

  await prisma.linkEvent.create({
    data: {
      linkId: link.id,
      ipHash: hashIp(ip),
      userAgent,
      referer,
      country,
      city,
      device: parsedUa.device,
      browser: parsedUa.browser,
      os: parsedUa.os,
    },
  });

  return NextResponse.redirect(link.destinationUrl, { status: 307 });
}
