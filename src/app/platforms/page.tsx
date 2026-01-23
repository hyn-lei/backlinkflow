import { PlatformsClient } from '../platforms-client';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export const metadata = {
  title: 'Platforms',
  description:
    'Browse curated platforms and see recommendations matched to your active project.',
  alternates: {
    canonical: '/platforms',
  },
  openGraph: {
    title: 'Platforms',
    description:
      'Browse curated platforms and see recommendations matched to your active project.',
    url: '/platforms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platforms',
    description:
      'Browse curated platforms and see recommendations matched to your active project.',
  },
};

export default async function PlatformsPage() {
  const categories = await directus().request(
    readItems('categories', {
      fields: ['id', 'name', 'slug'],
      sort: ['name'],
    })
  );

  return <PlatformsClient categories={categories} />;
}
