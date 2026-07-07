import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export const Default = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>Tell other players about yourself.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fs-name">Display name</FieldLabel>
          <Input id="fs-name" defaultValue="ShadowPlayer" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fs-tag">Tagline</FieldLabel>
          <Input id="fs-tag" placeholder="Souls-like enjoyer" />
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
)
