import {
  Field,
  FieldContent,
  FieldTitle,
  FieldDescription,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

export const Horizontal = () => (
  <div className="dark bg-background text-foreground max-w-md p-6">
    <Field orientation="horizontal">
      <FieldContent>
        <FieldTitle>Email notifications</FieldTitle>
        <FieldDescription>
          Get notified when a wishlisted game goes on sale.
        </FieldDescription>
      </FieldContent>
      <Switch defaultChecked />
    </Field>
  </div>
)
