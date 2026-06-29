import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export const Default = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <FieldSet>
      <FieldLegend>Account settings</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fl-email">Email</FieldLabel>
          <Input id="fl-email" type="email" placeholder="you@example.com" />
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
)
