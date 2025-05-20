import Markdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import { cn } from '@cosmoscan/shared/utils'

export default function MarkdownViewer({
  content,
  className,
}: {
  content?: string
  className?: string
}) {
  return (
    <Markdown
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        [rehypeExternalLinks, { target: '_blank', rel: 'noopener noreferrer' }],
        rehypeHighlight,
      ]}
    >
      {content}
    </Markdown>
  )
}
