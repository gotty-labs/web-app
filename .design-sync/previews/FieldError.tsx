import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export const Default = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <Field data-invalid="true">
      <FieldLabel htmlFor="un">Username</FieldLabel>
      <Input id="un" aria-invalid defaultValue="x" />
      <FieldError>Username must be at least 3 characters.</FieldError>
    </Field>
  </div>
)
