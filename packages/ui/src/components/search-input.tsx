'use client'

import { useCallback, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Input } from '../common/input'
import { CircleX, Loader, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { clientApi } from '@cosmoscan/core/trpc/react'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { FULL_ROUTES } from '@cosmoscan/shared/constants/routes'
import { SearchResult } from '@cosmoscan/shared/types'
import { cn, generatePath } from '@cosmoscan/shared/utils'
import { isValidBTCAddress } from '@cosmoscan/shared/utils/btc'
import { isValidAddress } from '@cosmoscan/shared/utils/chain'

interface SearchInputProps {
  classNames?: {
    root?: string
  }
  inputBordered?: boolean
}

export default function SearchInput({
  classNames,
  inputBordered = true,
}: SearchInputProps) {
  const t = useTranslations('Header')
  const { push } = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { mutateAsync: fetchContractsByLabel } =
    clientApi.internal.contract.fetchContractsByLabel.useMutation()

  const { mutateAsync: searchTokensByDenom } =
    clientApi.internal.token.searchTokensByDenom.useMutation()

  const { refetch: searchValidators } =
    clientApi.internal.validator.searchValidators.useQuery(searchValue || '', {
      enabled: false,
    })

  const { refetch: searchFinalityProviders } =
    clientApi.internal.finalityProvider.searchByName.useQuery(
      searchValue || '',
      {
        enabled: false,
      },
    )

  const onSearch = useCallback(async () => {
    const _searchValue = searchValue?.trim()
    if (!!!_searchValue) return

    setIsLoading(true)
    setSearchResults([])

    try {
      // Block - only handle pure numeric values
      if (/^\d+$/.test(_searchValue) && Number(_searchValue) > 0) {
        push(
          generatePath(FULL_ROUTES.blockchain.blocks.detail, {
            params: { height: _searchValue },
          }),
        )
        return
      }

      // Validator by address
      if (_searchValue.startsWith(`${CURRENT_CHAIN.addressPrexfix}valoper`)) {
        push(
          generatePath(FULL_ROUTES.blockchain.validators.detail, {
            params: { address: _searchValue.toLowerCase() },
          }),
        )
        return
      }

      // Address
      if (
        (CURRENT_CHAIN.isBabylon &&
          isValidBTCAddress(_searchValue.toLowerCase())) ||
        isValidAddress(_searchValue.toLowerCase())
      ) {
        push(
          generatePath(FULL_ROUTES.blockchain.addressDetail, {
            params: { address: _searchValue.toLowerCase() },
          }),
        )
        return
      }

      // Transaction
      if (_searchValue.length >= 64 && _searchValue.length <= 66) {
        // Add validation for Cosmos transaction hash format
        // Cosmos transaction hashes are base64 encoded and don't start with 0x
        if (_searchValue.startsWith('0x')) {
          toast.info(t('searchNotFoundTip'))
          return
        }
        push(
          generatePath(FULL_ROUTES.blockchain.transactions.detail, {
            params: { hash: _searchValue.toUpperCase() },
          }),
        )
        return
      }

      // If the input contains invalid characters for name search
      if (!/^[A-Za-z0-9\s_]+$/.test(_searchValue)) {
        toast.info(t('searchNotFoundTip'))
        return
      }

      // Search for all types by name
      const [validatorResults, fpResults, contracts, tokens] =
        await Promise.all([
          searchValidators(),
          searchFinalityProviders(),
          fetchContractsByLabel(_searchValue),
          searchTokensByDenom(_searchValue),
        ])

      const allResults = []

      // Add validators if found
      if (validatorResults.data && validatorResults.data.length > 0) {
        allResults.push(...validatorResults.data)
      }

      // Add finality providers if found
      if (fpResults.data && fpResults.data.length > 0) {
        allResults.push(...fpResults.data)
      }

      // Add contracts if found
      if (contracts.length > 0) {
        allResults.push(...contracts)
      }

      // Add tokens if found
      if (tokens.length > 0) {
        allResults.push(...tokens)
      }

      if (allResults.length > 0) {
        setSearchResults(allResults)
        return
      }

      toast.info('Search not found')
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while searching')
    } finally {
      setIsLoading(false)
      inputRef.current?.blur()
    }
  }, [
    t,
    searchValue,
    fetchContractsByLabel,
    searchTokensByDenom,
    searchValidators,
    searchFinalityProviders,
    push,
  ])

  const clearSearch = useCallback(() => {
    setSearchValue('')
    setSearchResults([])
  }, [])

  return (
    <div className={cn('flex-items-c', classNames?.root)}>
      <div
        className={cn(
          'flex-items-c text-foreground w-full rounded-md px-3',
          inputBordered ? 'border-border border' : '',
        )}
      >
        <Search className="shrink-0" size={12} />
        <Input
          ref={inputRef}
          className="w-full border-none md:w-[440px]"
          placeholder={t('searchPlaceholder')}
          value={searchValue}
          onChange={({ target }) => setSearchValue(target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />
        {isLoading ? (
          <Loader className="h-3.5 w-3.5 shrink-0 animate-spin" />
        ) : (
          <CircleX
            className={cn(
              'h-3.5 w-3.5 shrink-0 cursor-pointer transition-opacity hover:opacity-80',
              !!searchValue ? 'visible' : 'invisible',
            )}
            onClick={clearSearch}
          />
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="bg-card absolute top-full mt-2 w-full gap-1 rounded-md shadow-lg md:w-[440px]">
          {/* Group results by type */}
          {searchResults.some(result => 'operator_address' in result) && (
            <div className="p-2">
              <div className="text-muted-foreground mb-1 text-sm">
                Validators
              </div>
              {searchResults
                .filter(result => 'operator_address' in result)
                .map(validator => (
                  <div
                    key={validator.operator_address}
                    className="hover:text-foreground hover:bg-accent cursor-pointer p-2"
                    onClick={() => {
                      push(
                        generatePath(FULL_ROUTES.blockchain.validators.detail, {
                          params: { address: validator.operator_address || '' },
                        }),
                      )
                      clearSearch()
                    }}
                  >
                    <div>{validator.name || validator.operator_address}</div>
                  </div>
                ))}
            </div>
          )}

          {searchResults.some(result => 'btc_pk' in result) && (
            <div className="p-2">
              <div className="text-muted-foreground mb-1 text-sm">
                Finality Providers
              </div>
              {searchResults
                .filter(result => 'btc_pk' in result)
                .map(fp => (
                  <div
                    key={fp.btc_pk}
                    className="hover:text-foreground hover:bg-accent cursor-pointer p-2"
                    onClick={() => {
                      push(
                        generatePath(
                          FULL_ROUTES.blockchain.finalityProvider.detail,
                          {
                            params: { address: fp.btc_pk || '' },
                          },
                        ),
                      )
                      clearSearch()
                    }}
                  >
                    <div>{fp.name || fp.btc_pk}</div>
                  </div>
                ))}
            </div>
          )}

          {searchResults.some(result => 'denom' in result) && (
            <div className="p-2">
              <div className="text-muted-foreground mb-1 text-sm">Tokens</div>
              {searchResults
                .filter(result => 'denom' in result)
                .map(token => (
                  <div
                    key={token.denom}
                    className="hover:text-foreground hover:bg-accent cursor-pointer p-2"
                    onClick={() => {
                      push(
                        generatePath(FULL_ROUTES.token.detail, {
                          params: { denom: token.denom || '' },
                        }),
                      )
                      clearSearch()
                    }}
                  >
                    <div>{`${token.display_denom} (${token.denom})`}</div>
                  </div>
                ))}
            </div>
          )}

          {searchResults.some(
            result =>
              !('operator_address' in result) &&
              !('btc_pk' in result) &&
              !('denom' in result),
          ) && (
            <div className="p-2">
              <div className="text-muted-foreground mb-1 text-sm">
                Contracts
              </div>
              {searchResults
                .filter(
                  result =>
                    !('operator_address' in result) &&
                    !('btc_pk' in result) &&
                    !('denom' in result),
                )
                .map(contract => (
                  <div
                    key={contract.address}
                    className="hover:text-foreground hover:bg-accent cursor-pointer p-2"
                    onClick={() => {
                      push(
                        generatePath(FULL_ROUTES.contract.detail, {
                          params: { address: contract.address || '' },
                        }),
                      )
                      clearSearch()
                    }}
                  >
                    <div>{contract.label}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
