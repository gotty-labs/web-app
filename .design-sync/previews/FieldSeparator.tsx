import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export const WithText = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="sep-email">Email</FieldLabel>
        <Input id="sep-email" type="email" placeholder="you@example.com" />
      </Field>
      <FieldSeparator>Or continue with</FieldSeparator>
      <Field>
        <FieldLabel htmlFor="sep-user">Username</FieldLabel>
        <Input id="sep-user" placeholder="ShadowPlayer" />
      </Field>
    </FieldGroup>
  </div>
)
