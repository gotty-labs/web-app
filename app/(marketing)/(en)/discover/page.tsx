import { DiscoveryPage } from '../../_components/discovery-page'
import { buildDiscoveryMetadata } from '@/features/game/services/discovery'

export const revalidate = 280800

export function generateMetadata() {
  return buildDiscoveryMetadata('en')
}

export default function Page() {
  return <DiscoveryPage locale="en" />
}
