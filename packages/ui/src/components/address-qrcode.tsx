'use client'

import { Button } from '../common/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../common/dialog'
import { QrcodeIcon } from '../icons/qrcode'
import CopyWrapper from './copy-wrapper'
import { useTranslations } from 'next-intl'
import { QRCodeCanvas } from 'qrcode.react'

import { cn } from '@cosmoscan/shared/utils'

export interface AddressQrcodeProps {
  className?: string
  address?: string
  size?: number
}

export function AddressQrcode({
  className,
  address,
  size = 150,
}: AddressQrcodeProps) {
  return !!address ? (
    <div
      className={cn(
        'flex-c relative h-fit w-fit shrink-0 rounded-2xl bg-white p-3.5 shadow-sm',
        className,
      )}
    >
      <QRCodeCanvas size={size} value={address} />
    </div>
  ) : null
}

export interface AddressQrcodeViewerProps
  extends Omit<AddressQrcodeProps, 'className'> {
  classNames?: {
    icon?: string
    qrcode?: string
  }
}

export function AddressQrcodeViewer({
  classNames,
  ...props
}: AddressQrcodeViewerProps) {
  const t = useTranslations('Common')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-8 w-8" variant="ghost" size="icon">
          <QrcodeIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('addressQrcode')}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <AddressQrcode
          className={cn('m-auto', classNames?.qrcode)}
          size={300}
          {...props}
        />
        <DialogFooter>
          <CopyWrapper
            classNames={{ root: 'text-foreground/70' }}
            copyText={props.address}
          >
            {props.address}
          </CopyWrapper>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
