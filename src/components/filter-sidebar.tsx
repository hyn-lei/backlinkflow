'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Category } from '@/lib/directus';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  costFilter: string;
  onCostFilterChange: (cost: string) => void;
}

export function FilterSidebar({
  categories,
  selectedCategories,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  costFilter,
  onCostFilterChange,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search platforms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => onCategoryChange(category.id)}
                className="rounded border-border"
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Cost Type</h3>
        <div className="space-y-2">
          {['all', 'free', 'paid', 'freemium'].map((cost) => (
            <label
              key={cost}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="cost"
                checked={costFilter === cost}
                onChange={() => onCostFilterChange(cost)}
                className="border-border"
              />
              <span className="text-sm capitalize">{cost === 'all' ? 'All' : cost}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
