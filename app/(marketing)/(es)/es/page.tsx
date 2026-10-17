/** Spanish public landing (`/es`); the English one lives at `/`. Static, server-rendered. */
import { buildLandingMetadata, LandingPage } from '../../_components/landing-page'

export function generateMetadata() {
  return buildLandingMetadata('es')
}

export default function Page() {
  return <LandingPage locale="es" />
}
