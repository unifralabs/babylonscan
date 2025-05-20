'use client'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { isValidBTCAddress } from '@cosmoscan/shared/utils/btc'
import { isValidAddress } from '@cosmoscan/shared/utils/chain'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@cosmoscan/ui/accordion'
import { Card } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'

// Event structure interface to help with parsing
export interface EventAttribute {
  key: string
  value: string
  index: boolean
  msg_index: number
}

export interface EventLog {
  type: string
  attributes: EventAttribute[]
}

interface EventLogsProps {
  eventLogs: EventLog[]
  noLogsMessage?: string
}

export default function EventLogs({
  eventLogs,
  noLogsMessage = 'No event logs available',
}: EventLogsProps) {
  if (eventLogs.length === 0) {
    return (
      <Card className="p-gap">
        <div className="py-4 text-center">{noLogsMessage}</div>
      </Card>
    )
  }

  return (
    <Card className="p-gap">
      <div className="flex flex-col gap-4">
        {eventLogs.map((event, index) => (
          <EventLogItem key={index} event={event} index={index} />
        ))}
      </div>
    </Card>
  )
}

interface EventLogItemProps {
  event: EventLog
  index: number
}

function EventLogItem({ event, index }: EventLogItemProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" className="border-0">
        <AccordionTrigger className="hover:bg-secondary/50 rounded-lg px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <span className="text-foreground-secondary">#{index + 1}</span>
            <span className="font-medium">{event.type}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="bg-secondary overflow-hidden rounded-b-lg px-4 pb-4">
          <div className="flex flex-col gap-2">
            {event.attributes.map((attr, attrIndex) => (
              <div key={attrIndex} className="flex gap-2">
                <div className="text-foreground-secondary min-w-[120px]">
                  {attr.key}
                </div>
                <div className="break-all">
                  <AttributeValueRender value={attr.value} />
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function AttributeValueRender({ value }: { value: string }) {
  if (isValidAddress(value) || isValidBTCAddress(value)) {
    return <ExternalLinkRenderer type="address" content={value} short={true} />
  }

  if (value === 'amount' && /^\d+[a-z]+$/.test(value)) {
    const match = value.match(/^(\d+)([a-z]+)$/)
    if (match) {
      const [_, amount, denom] = match
      return (
        <AmountLabel amount={BigInt(Number(amount ?? 0))} currency={denom} />
      )
    }
  }

  return <span>{value}</span>
}

// Alternative component that groups events by type but preserves original order
export function EventLogsByType({
  eventLogs,
  noLogsMessage = 'No event logs available',
}: EventLogsProps) {
  if (eventLogs.length === 0) {
    return (
      <Card className="p-gap">
        <div className="py-4 text-center">{noLogsMessage}</div>
      </Card>
    )
  }

  // Group events by type for better organization
  const groupedEvents = eventLogs.reduce<Record<string, EventLog[]>>(
    (acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = []
      }
      acc[event.type].push(event)
      return acc
    },
    {},
  )

  return (
    <Card className="p-gap">
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(
          ([eventType, events], groupIndex) => (
            <div key={groupIndex} className="last:mb-0">
              <h3 className="text-foreground mb-4 text-lg font-semibold">
                {eventType}
              </h3>
              <div className="space-y-4">
                {events.map((event, eventIndex) => (
                  <Accordion key={eventIndex} type="single" collapsible>
                    <AccordionItem
                      value={`event-${groupIndex}-${eventIndex}`}
                      className="border-0"
                    >
                      <AccordionTrigger className="bg-muted hover:bg-muted/80 rounded-t-md px-4 py-3 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground-secondary text-xs">
                            Event #{eventIndex + 1} ({event.attributes.length}{' '}
                            attributes)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-secondary mt-px rounded-b-md px-4 pb-3 pt-2">
                        <table className="w-full">
                          <tbody>
                            {event.attributes.map((attr, attrIndex) => {
                              // Format value for display
                              if (
                                isValidAddress(attr.value) ||
                                isValidBTCAddress(attr.value)
                              ) {
                                return (
                                  <tr
                                    key={attrIndex}
                                    className="hover:bg-muted/50"
                                  >
                                    <td className="text-foreground-secondary py-2 pr-4 text-sm font-medium">
                                      {attr.key}
                                    </td>
                                    <td className="py-2 text-sm">
                                      <ExternalLinkRenderer
                                        type="address"
                                        content={attr.value}
                                        short={true}
                                      />
                                    </td>
                                  </tr>
                                )
                              }

                              // Check if value is an amount
                              if (
                                attr.key === 'amount' &&
                                /^\d+[a-z]+$/.test(attr.value)
                              ) {
                                const match =
                                  attr.value.match(/^(\d+)([a-z]+)$/)
                                if (match) {
                                  const [_, amount, denom] = match
                                  return (
                                    <tr
                                      key={attrIndex}
                                      className="hover:bg-muted/50"
                                    >
                                      <td className="text-foreground-secondary py-2 pr-4 text-sm font-medium">
                                        {attr.key}
                                      </td>
                                      <td className="py-2 text-sm">
                                        <AmountLabel
                                          amount={BigInt(Number(amount ?? 0))}
                                          currency={denom}
                                        />
                                      </td>
                                    </tr>
                                  )
                                }
                              }

                              return (
                                <tr
                                  key={attrIndex}
                                  className="hover:bg-muted/50"
                                >
                                  <td className="text-foreground-secondary py-2 pr-4 text-sm font-medium">
                                    {attr.key}
                                  </td>
                                  <td className="py-2 text-sm">{attr.value}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  )
}
