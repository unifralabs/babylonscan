import Link from 'next/link'

import { Button } from '../../common/button'
import { Tooltip } from '../../common/tooltip'
import { L2ScanLogoIcon } from '../../icons/l2scan-logo'
import { DiscordIcon, TwitterIcon } from '../../icons/socials'
import { FileEdit, Gift, Handshake, PencilRuler } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { SOCIAL_LINKS } from '@cosmoscan/shared/constants/common'
import { cn } from '@cosmoscan/shared/utils'

export interface FooterProps {
  className?: string
}

const FooterLinks = [
  {
    label: 'contactUs',
    children: [
      {
        label: 'subscribe',
        icon: <PencilRuler />,
        link: SOCIAL_LINKS.feedback,
      },
      {
        label: 'featureRequest',
        icon: <Handshake />,
        link: SOCIAL_LINKS.request,
      },
      { label: 'donate', icon: <Gift />, link: SOCIAL_LINKS.donate },
      {
        label: 'investment',
        icon: <FileEdit />,
        link: SOCIAL_LINKS.investment,
      },
    ],
  },
  {
    label: 'getToKnow',
    children: [
      {
        label: 'twitter',
        icon: <TwitterIcon />,
        link: SOCIAL_LINKS.twitter,
      },
      {
        label: 'discord',
        icon: <DiscordIcon />,
        link: SOCIAL_LINKS.discord,
      },
    ],
  },
]

export default async function Footer({ className }: FooterProps) {
  const t = await getTranslations('Footer')

  return (
    <footer
      className={cn(
        'p-page-gap bg-card border-border-light flex-c text-foreground flex-col gap-5 border-t xl:flex-row xl:justify-between',
        className,
      )}
    >
      <section className="flex-items-c flex-col gap-6 md:gap-4 xl:items-start">
        <L2ScanLogoIcon className="h-fit w-28" />

        <section className="text-center xl:text-left">
          {t('desc', { date: new Date().getFullYear() })}
        </section>
      </section>

      <div className="flex-items-c gap-4 whitespace-nowrap xl:gap-16">
        {FooterLinks.map(({ label, children }) => (
          <div
            key={label}
            className="flex-items-c flex-col gap-1 text-sm uppercase xl:items-start"
          >
            <span>{t(label)}</span>
            <div className="flex-items-c gap-2 md:gap-4">
              {children.map(({ label: cLabel, icon, link }) => (
                <Link
                  className="flex-items-c normal-case"
                  key={cLabel}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Tooltip content={t(cLabel)}>
                    <Button
                      className="hover:text-foreground"
                      variant="ghost"
                      size="icon"
                    >
                      <div className="flex-c h-5 w-5">{icon}</div>
                    </Button>
                  </Tooltip>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  )
}
