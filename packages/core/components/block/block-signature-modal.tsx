'use client'

import { useEffect, useState } from 'react'

import ExternalLinkRenderer from '../../components/external-link-renderer'
import { clientApi } from '../../trpc/react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { formatTimeAgo, formatUTCTime } from '@cosmoscan/shared/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cosmoscan/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@cosmoscan/ui/table'

// Define the signature data structure
interface ValidatorSignature {
  index: number
  validator_address: string
  validator_name?: string
  signed: boolean
  timestamp: number
  voting_power?: number
}

interface SignatureMetadata {
  totalSigned: number
  activeValidators: number
}

interface BlockSignaturesResponse {
  validators: ValidatorSignature[]
  metadata: SignatureMetadata
}

interface BlockSignatureModalProps {
  blockHeight: number
  children: React.ReactNode
}

export default function BlockSignatureModal({
  blockHeight,
  children,
}: BlockSignatureModalProps) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [signatures, setSignatures] = useState<ValidatorSignature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    signed: 0,
    unsigned: 0,
  })

  // Use tRPC query to fetch block signatures
  const {
    data,
    error,
    isLoading: isQueryLoading,
  } = clientApi.internal.block.fetchBlockSignatures.useQuery(blockHeight, {
    enabled: open, // Only fetch when modal is open
    retry: 1,
  })

  // Update signatures when data is available
  useEffect(() => {
    if (data) {
      // Handle the response format with validators and metadata
      const response = data as BlockSignaturesResponse
      const validators = response.validators || []
      const meta = response.metadata || {
        totalSigned: 0,
        activeValidators: 0,
      }

      // Process validator data
      const processedData = validators.map((sig: any) => ({
        ...sig,
        validator_name: sig.validator_name || undefined,
      }))

      setSignatures(processedData)

      // Simple calculation logic:
      // - total: active validators count (100)
      // - signed: total signatures count (96)
      // - unsigned: total - signed (4)
      const totalValidators = processedData.length
      const totalSigned = meta.totalSigned

      setStats({
        total: totalValidators,
        signed: totalSigned,
        unsigned: totalValidators - totalSigned,
      })

      setIsLoading(false)
    } else if (isQueryLoading) {
      setIsLoading(true)
    }
  }, [data, isQueryLoading])

  // Log errors to console if any
  useEffect(() => {
    if (error) {
      console.error('Error fetching block signatures:', error)
    }
  }, [error])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t('Block Signature Status')}
          </DialogTitle>
          {!isLoading && signatures.length > 0 && (
            <div className="text-muted-foreground text-sm">
              {t('Total Validators')}: {stats.total} | {t('Signed')}:{' '}
              <span className="text-green">{stats.signed}</span> |{' '}
              {t('Unsigned')}:{' '}
              <span className="text-red">{stats.unsigned}</span>
            </div>
          )}
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto pb-2">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="whitespace-nowrap">
                  <TableHead className="w-[60px]">{t('Index')}</TableHead>
                  <TableHead className="w-[40%]">{t('Validator')}</TableHead>
                  <TableHead className="w-[80px] text-center">
                    {t('Signed')}
                  </TableHead>
                  <TableHead className="text-right">{t('Time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {t('Loading signature data...')}
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-red h-24 text-center"
                    >
                      {t('Error loading signature data')}
                    </TableCell>
                  </TableRow>
                ) : signatures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {t('No signature data available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  signatures.map(signature => (
                    <TableRow key={signature.index}>
                      <TableCell className="font-medium">
                        #{signature.index}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px] overflow-hidden">
                          {signature.validator_name ? (
                            <ExternalLinkRenderer
                              classNames={{
                                link: 'text-primary hover:underline truncate block',
                              }}
                              type="validator"
                              content={signature.validator_name}
                              pathParamValue={signature.validator_address}
                              short={false}
                            />
                          ) : (
                            <ExternalLinkRenderer
                              classNames={{
                                link: 'text-primary hover:underline truncate block font-mono text-sm',
                              }}
                              type="validator"
                              content={signature.validator_address}
                              short={true}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {signature.signed === true ? (
                          <CheckCircle className="text-green mx-auto h-5 w-5" />
                        ) : (
                          <XCircle className="text-red mx-auto h-5 w-5" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">
                            {formatTimeAgo(signature.timestamp)}
                          </span>
                          <span className="text-muted-foreground whitespace-nowrap text-sm">
                            {formatUTCTime(signature.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
