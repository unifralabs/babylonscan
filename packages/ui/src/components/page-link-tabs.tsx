'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import DataTabs, { type UnderlineTabsProps } from './underline-tabs'

import { stringifyUrl } from '@cosmoscan/shared/utils'

export interface PageLinkTabsProps extends UnderlineTabsProps {
  queryKey: string
  defaultValue?: string
}

export default function PageLinkTabs({
  queryKey,
  defaultValue,
  ...props
}: PageLinkTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <DataTabs
      {...props}
      activeTab={
        undefined === props?.activeTab
          ? searchParams.get(queryKey) || defaultValue
          : props?.activeTab
      }
      onValueChange={value =>
        router.push(
          stringifyUrl(pathname, {
            ...Array.from(searchParams.entries()).reduce(
              (obj: Record<string, string>, [k, v]) => {
                obj[k] = decodeURIComponent(v)
                return obj
              },
              {},
            ),
            [queryKey]: value,
          }),
        )
      }
    />
  )
}
