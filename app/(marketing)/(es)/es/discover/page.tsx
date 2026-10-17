import { DiscoveryPage } from '../../../_components/discovery-page'
import { buildDiscoveryMetadata } from '@/features/game/services/discovery'

export const revalidate = 280800

export function generateMetadata() {
  return buildDiscoveryMetadata('es')
}

export default function Page() {
  return <DiscoveryPage locale="es" />
}
