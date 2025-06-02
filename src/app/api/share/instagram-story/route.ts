import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const WIDTH = 1080;
const HEIGHT = 1920;
const PADDING = 40;
const FONT_SIZE = {
  title: 72,
  subtitle: 48,
  description: 36,
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const data = JSON.parse(decodeURIComponent(searchParams.get('data') || '{}'));

    if (!data.title || !data.type) {
      return NextResponse.json({ error: 'Invalid share data' }, { status: 400 });
    }

    // Create base image with gradient background
    const image = sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    });

    // Add gradient overlay
    const gradient = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.7 },
      },
    })
      .linear(0, 0, 0, HEIGHT, { r: 0, g: 0, b: 0, alpha: 0.7 }, { r: 0, g: 0, b: 0, alpha: 0 })
      .toBuffer();

    // Add background image if provided
    if (data.image) {
      const backgroundImage = await fetch(data.image)
        .then((res) => res.arrayBuffer())
        .then((buffer) => Buffer.from(buffer));

      image.composite([
        {
          input: backgroundImage,
          blend: 'overlay',
        },
        {
          input: gradient,
          blend: 'overlay',
        },
      ]);
    } else {
      image.composite([{ input: gradient }]);
    }

    // Add app logo
    const logo = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`)
      .then((res) => res.arrayBuffer())
      .then((buffer) => Buffer.from(buffer));

    image.composite([
      {
        input: logo,
        top: PADDING,
        left: PADDING,
      },
    ]);

    // Add text content
    const svgContent = `
      <svg width="${WIDTH}" height="${HEIGHT}">
        <style>
          .title { font-family: Arial; font-size: ${FONT_SIZE.title}px; fill: white; font-weight: bold; }
          .subtitle { font-family: Arial; font-size: ${FONT_SIZE.subtitle}px; fill: white; }
          .description { font-family: Arial; font-size: ${FONT_SIZE.description}px; fill: white; opacity: 0.8; }
        </style>
        <text x="${PADDING}" y="${HEIGHT - PADDING * 4}" class="title">${data.title}</text>
        ${data.description ? `<text x="${PADDING}" y="${HEIGHT - PADDING * 3}" class="description">${data.description}</text>` : ''}
        <text x="${PADDING}" y="${HEIGHT - PADDING * 2}" class="subtitle">Listen on ${process.env.NEXT_PUBLIC_APP_NAME}</text>
      </svg>
    `;

    image.composite([
      {
        input: Buffer.from(svgContent),
        blend: 'over',
      },
    ]);

    // Generate final image
    const finalImage = await image.png().toBuffer();

    return new NextResponse(finalImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Instagram story generation error:', error);
    return NextResponse.json({ error: 'Failed to generate story image' }, { status: 500 });
  }
} 