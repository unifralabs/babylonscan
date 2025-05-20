export function formatProposalMessageTypeFromMessages(
  messages?: any[]
) {
  // Handle different message formats
  if (!messages || messages.length === 0) {
    return 'Unknown'
  }

  // Try to extract from content first (common format)
  const contentType = messages[0]?.content?.['@type']
  if (contentType) {
    return contentType
      .split('.')
      .pop()
      ?.split(/(?=[A-Z])/)
      ?.filter((str: string) => str !== 'Proposal')
      ?.join(' ') || 'Unknown'
  }

  // Try to extract from the message directly (another format)
  const messageType = messages[0]?.['@type']
  if (messageType) {
    return messageType
      .split('.')
      .pop()
      ?.split(/(?=[A-Z])/)
      ?.filter((str: string) => str !== 'Proposal')
      ?.join(' ') || 'Unknown'
  }

  // Check if it's a MsgExec (execute messages on behalf of other accounts)
  if (messages[0]?.hasOwnProperty('msgs')) {
    return 'Msg Exec'
  }

  // For legacy proposals or unknown types
  return 'Text'
}
