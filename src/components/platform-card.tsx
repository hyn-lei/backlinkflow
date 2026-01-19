'use client';

import { ExternalLink, Plus, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Platform, getDirectusFileUrl } from '@/lib/directus';
import { useAuth } from '@/hooks/use-auth';
import { useBoardStore } from '@/stores/board-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PlatformCardProps {
  platform: Platform;
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { items, addToBoard, isAdding } = useBoardStore();
  
  const isAdded = items.some((item) => 
    typeof item.platform === 'string' 
      ? item.platform === platform.id 
      : item.platform.id === platform.id
  );

  const getDaBadgeVariant = (da: number) => {
    if (da >= 70) return 'success';
    if (da >= 40) return 'warning';
    return 'secondary';
  };

  const handleAddToBoard = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await addToBoard(platform.id, user.id);
      toast.success(`Added ${platform.name} to your board`);
    } catch {
      toast.error('Failed to add to board');
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {platform.logo ? (
              <img
                src={getDirectusFileUrl(platform.logo) || ''}
                alt={platform.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">
                  {platform.name[0]}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">{platform.name}</h3>
              <a
                href={platform.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center"
              >
                Visit site <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {platform.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={getDaBadgeVariant(platform.domain_authority)}>
              DA: {platform.domain_authority}
            </Badge>
            <Badge variant={platform.cost_type === 'free' ? 'success' : 'secondary'}>
              {platform.cost_type.charAt(0).toUpperCase() + platform.cost_type.slice(1)}
            </Badge>
          </div>

          <Button
            size="sm"
            variant={isAdded ? 'secondary' : 'default'}
            onClick={handleAddToBoard}
            disabled={isAdded || isAdding}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
