import Link from 'next/link';
import { directus, getDirectusFileUrl } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Blog',
  description: 'Product distribution playbooks, backlink tactics, and growth ops insights.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog',
    description: 'Product distribution playbooks, backlink tactics, and growth ops insights.',
    url: '/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog',
    description: 'Product distribution playbooks, backlink tactics, and growth ops insights.',
  },
};

type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  date_created: string;
  reading_time?: number | null;
  tags?: string | string[] | null;
  author?: string | { name?: string | null; title?: string | null; avatar?: string | null } | null;
};

const FALLBACK_AUTHOR = {
  name: 'BacklinkFlow Team',
  title: 'Editorial',
};

const parseTags = (tags?: string | string[] | null) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const getAuthorMeta = (author?: PostSummary['author'] | null) => {
  if (!author || typeof author === 'string') {
    return {
      name: FALLBACK_AUTHOR.name,
      title: FALLBACK_AUTHOR.title,
      avatar: null,
    };
  }

  return {
    name: author.name || FALLBACK_AUTHOR.name,
    title: author.title || FALLBACK_AUTHOR.title,
    avatar: author.avatar || null,
  };
};

export default async function BlogPage() {
  const posts = await directus().request(
    readItems('posts', {
      filter: { status: { _eq: 'published' } },
      fields: [
        'id',
        'title',
        'slug',
        'excerpt',
        'cover_image',
        'date_created',
        'reading_time',
        'tags',
        { author: ['name', 'title', 'avatar'] },
      ],
      sort: ['-date_created'],
    })
  ) as PostSummary[];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border/40 bg-background py-12">
          <div className="container">
            <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">Blog</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
              Playbooks, experiments, and tactical guides for distribution.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const author = getAuthorMeta(post.author);
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group rounded-2xl border border-border/60 bg-background/70 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
                    >
                      {post.cover_image ? (
                        <img
                          src={getDirectusFileUrl(post.cover_image) || ''}
                          alt={post.title}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="h-40 w-full bg-gradient-to-br from-muted/50 via-muted/20 to-transparent" />
                      )}
                      <div className="p-5 space-y-3">
                        <h2 className="text-lg font-semibold group-hover:text-primary">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt || 'Read the full article for details.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {author.avatar ? (
                            <img
                              src={getDirectusFileUrl(author.avatar) || ''}
                              alt={author.name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground flex items-center justify-center">
                              {author.name
                                .split(' ')
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                          )}
                          <Badge variant="secondary">{author.name}</Badge>
                          <span>{new Date(post.date_created).toLocaleDateString()}</span>
                          {post.reading_time ? <span>· {post.reading_time} min read</span> : null}
                        </div>
                        {parseTags(post.tags).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {parseTags(post.tags).map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export const revalidate = 60;
