/** English public landing (`/`); the Spanish one lives at `/es`. Static, server-rendered. */
import { buildLandingMetadata, LandingPage } from '../_components/landing-page'

export function generateMetadata() {
  return buildLandingMetadata('en')
}

export default function Page() {
  return <LandingPage locale="en" />
}
