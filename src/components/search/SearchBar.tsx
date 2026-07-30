'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  loading?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = 'Buscar no Diário Oficial...',
  initialValue = '',
  loading = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim().length >= 3) onSearch(value.trim());
    },
    [value, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          icon={<Search className="w-4 h-4" />}
        />
      </div>
      <Button type="submit" disabled={loading || value.trim().length < 3}>
        {loading ? 'Buscando…' : 'Buscar'}
      </Button>
    </form>
  );
}
