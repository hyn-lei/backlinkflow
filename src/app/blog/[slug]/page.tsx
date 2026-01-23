import { directus, getDirectusFileUrl } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{ slug: string }>;
}

type PostDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  date_created: string;
  reading_time?: number | null;
  tags?: string | string[] | null;
  seo?: {
    title?: string | null;
    meta_description?: string | null;
    og_image?: string | null;
  } | null;
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

const getAuthorMeta = (author?: PostDetail['author'] | null) => {
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

async function getPost(slug: string): Promise<PostDetail | null> {
  const posts = await directus().request(
    readItems('posts', {
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      fields: ['*'],
      limit: 1,
    })
  ) as PostDetail[];
  return posts[0] || null;
}

export async function generateStaticParams() {
  try {
    const posts = await directus().request(
      readItems('posts', {
        filter: { status: { _eq: 'published' } },
        fields: ['slug'],
      })
    ) as { slug: string }[];
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const seoTitle = post.seo?.title || post.title;
  const seoDescription =
    post.seo?.meta_description || post.excerpt || `Read ${post.title} on BacklinkFlow.`;
  const seoImage = post.seo?.og_image ? getDirectusFileUrl(post.seo.og_image) : null;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `/blog/${post.slug}`,
      type: 'article',
      images: seoImage ? [seoImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: seoImage ? [seoImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const author = getAuthorMeta(post.author);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border/40 bg-background py-10">
          <div className="container">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
              {author.title ? <span>· {author.title}</span> : null}
              <span>{new Date(post.date_created).toLocaleDateString()}</span>
              {post.reading_time ? <span>· {post.reading_time} min read</span> : null}
            </div>
            {parseTags(post.tags).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {parseTags(post.tags).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-10">
          <div className="container max-w-3xl">
            {post.cover_image && (
              <img
                src={getDirectusFileUrl(post.cover_image) || ''}
                alt={post.title}
                className="w-full rounded-2xl object-cover mb-8"
              />
            )}
            {post.content ? (
              <article className="prose prose-slate max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
                Content is being finalized. Please check back soon.
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
