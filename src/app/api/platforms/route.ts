import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { directus } from '@/lib/directus';
import { verifySession } from '@/lib/auth';
import { createItem } from '@directus/sdk';

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { name, website_url, description, cost_type } = await request.json();

    if (!name || !website_url) {
      return NextResponse.json(
        { error: 'Name and website URL are required' },
        { status: 400 }
      );
    }

    // Validate cost_type
    const validCostTypes = ['free', 'paid', 'freemium'];
    const finalCostType = validCostTypes.includes(cost_type) ? cost_type : 'free';

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const platform = await directus().request(
      createItem('platforms', {
        name,
        slug,
        website_url,
        description: description || '',
        status: 'pending_review',
        cost_type: finalCostType,
        domain_authority: 0,
        user_created: session.userId,
      })
    );

    return NextResponse.json({ platform, message: 'Platform submitted for review' });
  } catch (error) {
    console.error('Failed to submit platform:', error);
    return NextResponse.json(
      { error: 'Failed to submit platform' },
      { status: 500 }
    );
  }
}
