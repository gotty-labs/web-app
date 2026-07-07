import {
  Field,
  FieldContent,
  FieldTitle,
  FieldDescription,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

export const Default = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <Field orientation="horizontal">
      <FieldContent>
        <FieldTitle>Auto-update games</FieldTitle>
        <FieldDescription>Keep your library on the latest patch.</FieldDescription>
      </FieldContent>
      <Switch defaultChecked />
    </Field>
  </div>
)
