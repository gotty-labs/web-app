import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

export const Default = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>@</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="username" defaultValue="shadowplayer" />
    </InputGroup>
  </div>
)
