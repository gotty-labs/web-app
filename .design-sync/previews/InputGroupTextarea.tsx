import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
  InputGroupText,
} from '@/components/ui/input-group'

export const Default = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <InputGroup>
      <InputGroupTextarea
        placeholder="Write a review…"
        defaultValue="Incredible world design and combat. Easily my game of the year."
      />
      <InputGroupAddon align="block-end">
        <InputGroupText>280 characters left</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </div>
)
