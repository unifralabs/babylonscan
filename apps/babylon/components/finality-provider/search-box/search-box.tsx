'use client'

import { useEffect, useState } from 'react'

import { Search, X } from 'lucide-react'

import { Input } from '@cosmoscan/ui/input'

interface SearchBoxProps {
  placeholder: string
  onSearch: (query: string) => void
}

export default function SearchBox({ placeholder, onSearch }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => onSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, onSearch])

  return (
    <div className="relative min-w-[200px]">
      <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full pl-9 pr-9"
      />
      {searchQuery && (
        <X
          className="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer"
          onClick={() => setSearchQuery('')}
        />
      )}
    </div>
  )
}
