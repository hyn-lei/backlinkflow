'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PlatformCard } from '@/components/platform-card';
import { FilterSidebar } from '@/components/filter-sidebar';
import { Platform, Category } from '@/lib/directus';
import { useBoardStore } from '@/stores/board-store';
import { useProjectStore } from '@/stores/project-store';
import { useAuth } from '@/hooks/use-auth';

interface PlatformsClientProps {
  categories: Category[];
}

export function PlatformsClient({ categories }: PlatformsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [costFilter, setCostFilter] = useState('all');
  const [recommendedPlatforms, setRecommendedPlatforms] = useState<Platform[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [hasLoadedRecommendations, setHasLoadedRecommendations] = useState(false);
  const [fallbackPlatforms, setFallbackPlatforms] = useState<Platform[]>([]);
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [isHeaderAnimating, setIsHeaderAnimating] = useState(false);

  const { fetchBoard } = useBoardStore();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentProjectId, projects } = useProjectStore();
  const currentProject = projects.find((p) => p.id === currentProjectId);

  useEffect(() => {
    if (currentProjectId) {
      fetchBoard(currentProjectId);
    }
  }, [currentProjectId, fetchBoard]);

  useEffect(() => {
    if (!currentProjectId) {
      setRecommendedPlatforms([]);
      setHasLoadedRecommendations(false);
      return;
    }

    const run = async () => {
      setIsLoadingRecommendations(true);
      try {
        const res = await fetch(`/api/recommendations?projectId=${currentProjectId}`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        setRecommendedPlatforms(data.items || []);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setRecommendedPlatforms([]);
      } finally {
        setIsLoadingRecommendations(false);
        setHasLoadedRecommendations(true);
      }
    };

    run();
  }, [currentProjectId]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (user && !showAllPlatforms) {
      setFallbackPlatforms([]);
      return;
    }

    const run = async () => {
      setIsLoadingFallback(true);
      try {
        const res = await fetch('/api/platforms');
        if (!res.ok) throw new Error('Failed to fetch platforms');
        const data = await res.json();
        setFallbackPlatforms(data.platforms || []);
      } catch (error) {
        console.error('Failed to load platforms:', error);
        setFallbackPlatforms([]);
      } finally {
        setIsLoadingFallback(false);
      }
    };

    run();
  }, [user, isAuthLoading, currentProjectId, showAllPlatforms]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const platformSource =
    user && !showAllPlatforms ? recommendedPlatforms : fallbackPlatforms;

  const filteredPlatforms = useMemo(() => {
    return platformSource.filter((platform) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !platform.name.toLowerCase().includes(query) &&
          !platform.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Cost filter
      if (costFilter !== 'all' && platform.cost_type !== costFilter) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const platformCategoryIds = platform.categories?.map((c) =>
          typeof c.categories_id === 'string' ? c.categories_id : c.categories_id?.id
        ) || [];
        if (!selectedCategories.some((id) => platformCategoryIds.includes(id))) {
          return false;
        }
      }

      return true;
    });
  }, [platformSource, searchQuery, costFilter, selectedCategories]);

  useEffect(() => {
    setIsHeaderAnimating(true);
    const timer = window.setTimeout(() => {
      setIsHeaderAnimating(false);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [showAllPlatforms, currentProject?.name, filteredPlatforms.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-10 md:py-12" id="directory">
          <div className="container">
            <div className="mb-6 border-b border-border/40 pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
                    Platforms
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredPlatforms.length} platforms matched to your project.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {currentProject?.name && (
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-2 text-sm">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Project
                      </div>
                      <div className="font-medium text-foreground">
                        {currentProject.name}
                      </div>
                      {currentProject.website_url && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[240px]">
                          {currentProject.website_url}
                        </div>
                      )}
                    </div>
                  )}

                  {!user && (
                    <Link href="/sign-up">
                      <Button size="sm" className="rounded-full px-6">
                        Create Project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <aside className="w-full md:w-64 shrink-0">
                <FilterSidebar
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={handleCategoryChange}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  costFilter={costFilter}
                  onCostFilterChange={setCostFilter}
                />
              </aside>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  {(() => {
                    const hasResults = filteredPlatforms.length > 0;
                    const headerLabel = hasResults
                      ? currentProject?.name && !showAllPlatforms
                        ? `Recommended for ${currentProject.name}`
                        : 'All Platforms'
                      : null;
                    return headerLabel ? (
                      <h2
                        className={`text-2xl font-semibold transition-all duration-150 ${
                          isHeaderAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                        }`}
                      >
                        {headerLabel}
                        <span className="text-muted-foreground"> ({filteredPlatforms.length})</span>
                      </h2>
                    ) : null;
                  })()}
                  {currentProject?.name && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllPlatforms((prev) => !prev)}
                    >
                      {showAllPlatforms ? 'Show Recommendations' : 'Show All Platforms'}
                    </Button>
                  )}
                </div>

                {(user && !showAllPlatforms
                  ? isLoadingRecommendations || !hasLoadedRecommendations
                  : isLoadingFallback) ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading recommendations...
                  </div>
                ) : filteredPlatforms.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {user && !showAllPlatforms
                      ? 'No recommendations found for this project yet.'
                      : 'All Platforms is empty right now.'}
                  </div>
                ) : (
                  <>
                    {!user && (
                      <div className="mb-6 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        Showing all platforms. Sign in to get personalized recommendations.
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPlatforms.map((platform) => (
                        <PlatformCard key={platform.id} platform={platform} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
