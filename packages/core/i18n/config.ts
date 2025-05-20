export type Locale = (typeof locales)[number]

export const locales = ['en', 'zh', 'ko', 'vi'] as const
export const defaultLocale: Locale = 'en'

export const localeOptions: Array<{ label: string; value: Locale }> = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh' },
  { label: '한국어', value: 'ko' },
  { label: 'Tiếng Việt', value: 'vi' },
]
