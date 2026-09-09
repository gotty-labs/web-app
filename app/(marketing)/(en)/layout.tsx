import { rootHtmlClassName, rootMetadata, RootContent } from '../../_shared'

import '../../globals.css'

export const metadata = rootMetadata

export default function EnglishMarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rootHtmlClassName}>
      <body className="flex min-h-full flex-col">
        <RootContent>{children}</RootContent>
      </body>
    </html>
  )
}
