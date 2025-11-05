import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterState) => void;
}

export interface FilterState {
  priceMin: number;
  priceMax: number;
  medium: string;
  availability: string;
  sortBy: string;
}

const SearchFilters = ({ onSearch, onFilter }: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priceMin: 0,
    priceMax: 100000,
    medium: 'all',
    availability: 'all',
    sortBy: 'newest',
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handlePriceChange = (values: number[]) => {
    const newFilters = { ...filters, priceMin: values[0], priceMax: values[1] };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      priceMin: 0,
      priceMax: 100000,
      medium: 'all',
      availability: 'all',
      sortBy: 'newest',
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search artworks, artists..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1"
        />
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label>Price Range (USD)</Label>
                <div className="px-2">
                  <Slider
                    value={[filters.priceMin, filters.priceMax]}
                    onValueChange={handlePriceChange}
                    max={100000}
                    step={1000}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${filters.priceMin.toLocaleString()}</span>
                    <span>${filters.priceMax.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medium</Label>
                <Select value={filters.medium} onValueChange={(v) => updateFilter('medium', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mediums</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="sculpture">Sculpture</SelectItem>
                    <SelectItem value="digital">Digital Art</SelectItem>
                    <SelectItem value="mixed">Mixed Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={filters.availability} onValueChange={(v) => updateFilter('availability', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="title">Title: A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={resetFilters} variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SearchFilters;
