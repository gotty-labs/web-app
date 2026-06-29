import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export const Group = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="dn">Display name</FieldLabel>
        <Input id="dn" defaultValue="ShadowPlayer" />
        <FieldDescription>This is how other players will see you.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="em">Email</FieldLabel>
        <Input id="em" type="email" placeholder="you@example.com" />
      </Field>
    </FieldGroup>
  </div>
)
