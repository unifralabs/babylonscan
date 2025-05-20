'use client'

import { createElement } from 'react'

import { CircleCheck, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ValidatorStatusEnum } from '@cosmoscan/shared/types'
import { cn } from '@cosmoscan/shared/utils'

export default function ValidatorStatus({
  status,
  jailed = false,
}: {
  status?: ValidatorStatusEnum | null
  jailed?: boolean | null
}) {
  const t = useTranslations('Common')
  if (!status) return null

  const isActive = ValidatorStatusEnum.BOND_STATUS_BONDED === status

  return (
    <div
      className={cn(
        'flex-c text-primary-foreground w-fit gap-2 rounded-md px-3 py-2 text-sm',
        isActive ? 'bg-green' : 'bg-red',
      )}
    >
      {createElement(isActive ? CircleCheck : Info, {
        size: 12,
      })}
      <span className="capitalize">
        {t(isActive ? 'active' : !!jailed ? 'jailed' : 'inactive')}
      </span>
    </div>
  )
}
