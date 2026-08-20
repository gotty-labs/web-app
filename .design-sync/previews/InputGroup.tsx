import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
} from '@/components/ui/input-group'
import { SearchIcon, XIcon } from 'lucide-react'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground flex max-w-md flex-col gap-3 p-6">
    {children}
  </div>
)

export const Search = () => (
  <Frame>
    <InputGroup>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search games…" defaultValue="Elden Ring" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Clear">
          <XIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </Frame>
)

export const WithText = () => (
  <Frame>
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="your-profile" defaultValue="shadowplayer" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.gotty.gg</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </Frame>
)
