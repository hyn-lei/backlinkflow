import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HIGHLIGHTS = [
  'Project-level tracking for every channel and submission.',
  'Recommendations based on your product tags and market.',
  'Clear status flow from idea to live backlink.',
  'One board per project so teams stay focused.',
];

const FAQS = [
  {
    question: 'What is BacklinkFlow used for?',
    answer:
      'BacklinkFlow is a growth operations workspace that helps you plan distribution, find high-signal platforms, and track backlink submissions per project.',
  },
  {
    question: 'How are recommendations generated?',
    answer:
      'We match your project categories to platform categories, then boost universal platforms labeled General to make sure core distribution is covered.',
  },
  {
    question: 'Can I manage multiple products?',
    answer:
      'Yes. Each project has its own board, status pipeline, and recommended platforms so context never mixes.',
  },
  {
    question: 'Is this only for SEO?',
    answer:
      'No. The workflow is designed for growth ops: distribution, PR, and channel execution, with backlinks as the measurable output.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/40 bg-background pt-20 pb-20 md:pt-28 md:pb-28">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-6 inline-flex items-center gap-2 bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
                Growth Ops for Distribution
              </Badge>
              <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Turn backlink outreach into a repeatable growth system
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                BacklinkFlow helps teams plan distribution, discover the right platforms,
                and track outreach status by project. No spreadsheets. No chaos.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/sign-up">
                  <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                    Start Growth Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/platforms">
                  <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                    Browse Platforms
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-3xl font-semibold mb-4">Why Growth Ops teams use BacklinkFlow</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  It is not just a directory. BacklinkFlow is an execution layer for
                  distribution. Every project gets its own recommended channel plan,
                  and every platform moves through a clear status pipeline.
                </p>
              </div>
              <div className="space-y-3">
                {HIGHLIGHTS.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 border-t border-border/40">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Build a channel plan',
                  text: 'Create a project, pick categories, and let the system assemble a focused distribution list.',
                },
                {
                  title: 'Execute with a board',
                  text: 'Move each platform from todo to live. Capture notes and backlink URLs along the way.',
                },
                {
                  title: 'Repeat and scale',
                  text: 'Switch projects instantly and reuse workflows without mixing platforms or status.',
                },
              ].map((step) => (
                <div key={step.title} className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 border-t border-border/40">
          <div className="container">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold mb-6">FAQ</h2>
              <div className="space-y-4">
                {FAQS.map((faq) => (
                  <div key={faq.question} className="rounded-xl border border-border/60 bg-muted/10 p-5">
                    <h3 className="font-medium mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export const revalidate = 60;
export const metadata = {
  title: 'Growth Ops for Distribution',
  description:
    'BacklinkFlow helps teams plan distribution, find high-signal platforms, and track backlink submissions per project.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Growth Ops for Distribution',
    description:
      'BacklinkFlow helps teams plan distribution, find high-signal platforms, and track backlink submissions per project.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Growth Ops for Distribution',
    description:
      'BacklinkFlow helps teams plan distribution, find high-signal platforms, and track backlink submissions per project.',
  },
};
