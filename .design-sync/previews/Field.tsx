import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldContent,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="dark bg-background text-foreground max-w-md p-6">{children}</div>
)

export const Basic = () => (
  <Frame>
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="display-name">Display name</FieldLabel>
        <Input id="display-name" defaultValue="ShadowPlayer" />
        <FieldDescription>
          This is how other players will see you.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" type="email" placeholder="you@example.com" />
      </Field>
    </FieldGroup>
  </Frame>
)

export const Invalid = () => (
  <Frame>
    <Field data-invalid="true">
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" aria-invalid defaultValue="x" />
      <FieldError>Username must be at least 3 characters.</FieldError>
    </Field>
  </Frame>
)

export const Horizontal = () => (
  <Frame>
    <Field orientation="horizontal">
      <FieldContent>
        <FieldTitle>Email notifications</FieldTitle>
        <FieldDescription>
          Get notified when a wishlisted game goes on sale.
        </FieldDescription>
      </FieldContent>
      <Switch defaultChecked />
    </Field>
  </Frame>
)
