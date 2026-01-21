import { directus, Platform, getDirectusFileUrl } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlatformDetailClient } from './platform-detail-client';

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getPlatform(slug: string): Promise<Platform | null> {
    try {
        const platforms = await directus().request(
            readItems('platforms', {
                filter: {
                    slug: { _eq: slug },
                    status: { _eq: 'published' }
                },
                fields: ['*', { categories: [{ categories_id: ['*'] }] }],
                limit: 1,
            })
        );
        return platforms[0] || null;
    } catch {
        return null;
    }
}

export async function generateStaticParams() {
    try {
        const platforms = await directus().request(
            readItems('platforms', {
                filter: { status: { _eq: 'published' } },
                fields: ['slug'],
            })
        );
        return platforms.map((platform) => ({
            slug: platform.slug,
        }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const platform = await getPlatform(slug);

    if (!platform) {
        return { title: 'Platform Not Found' };
    }

    return {
        title: `${platform.name} - BacklinkFlow`,
        description: platform.description || `Learn how to build backlinks on ${platform.name}`,
    };
}

export default async function PlatformPage({ params }: PageProps) {
    const { slug } = await params;
    const platform = await getPlatform(slug);

    if (!platform) {
        notFound();
    }

    const getDaBadgeVariant = (da: number) => {
        if (da >= 70) return 'success';
        if (da >= 40) return 'warning';
        return 'secondary';
    };

    const categories = platform.categories?.map((c) =>
        typeof c.categories_id === 'string' ? null : c.categories_id
    ).filter(Boolean) || [];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Header Section */}
                <section className="border-b border-border bg-gradient-to-b from-background to-muted/30">
                    <div className="container py-8 md:py-12">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Directory
                        </Link>

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Logo */}
                            <div className="shrink-0">
                                {platform.logo ? (
                                    <img
                                        src={getDirectusFileUrl(platform.logo) || ''}
                                        alt={platform.name}
                                        className="h-24 w-24 rounded-xl object-cover border border-border shadow-sm"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border">
                                        <span className="text-3xl font-bold text-primary">
                                            {platform.name[0]}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">{platform.name}</h1>
                                <p className="text-lg text-muted-foreground mb-4">{platform.description}</p>

                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <Badge variant={getDaBadgeVariant(platform.domain_authority)} className="text-sm">
                                        DA: {platform.domain_authority}
                                    </Badge>
                                    <Badge variant={platform.cost_type === 'free' ? 'success' : 'secondary'} className="text-sm">
                                        {platform.cost_type.charAt(0).toUpperCase() + platform.cost_type.slice(1)}
                                    </Badge>
                                    {categories.map((cat) => (
                                        <Badge key={cat?.id} variant="secondary" className="text-sm">
                                            {cat?.name}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <a href={platform.website_url} target="_blank" rel="noopener noreferrer">
                                        <Button>
                                            <Globe className="h-4 w-4 mr-2" />
                                            Visit Website
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Detail Content */}
                <section className="py-12">
                    <div className="container">
                        <div className="max-w-4xl">
                            {platform.detail ? (
                                <Card>
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold mb-6">Backlink Building Guide</h2>
                                        <PlatformDetailClient content={platform.detail} />
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center text-muted-foreground">
                                        <p>No detailed guide available for this platform yet.</p>
                                        <p className="text-sm mt-2">Check back later for tips on building backlinks here.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export const revalidate = 60;
