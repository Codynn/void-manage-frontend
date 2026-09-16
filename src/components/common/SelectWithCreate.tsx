import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const CREATE_SENTINEL = "__create_new__";
export const NONE_SENTINEL = "__none__";

interface SelectWithCreateProps {
  value: string;
  onChange: (value: string) => void;
  items: { _id: string; label: string }[];
  placeholder?: string;
  noneLabel?: string;
  createLabel: string;
  onCreate: () => void;
  disabled?: boolean;
}

// A normal Select, plus a "+ Create new..." row that triggers navigation/a
// create flow instead of ever being selected as a value - used everywhere an
// admin picks a template/policy that might not exist yet.
const SelectWithCreate = ({
  value,
  onChange,
  items,
  placeholder = "None",
  noneLabel = "None",
  createLabel,
  onCreate,
  disabled,
}: SelectWithCreateProps) => {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === CREATE_SENTINEL) {
          onCreate();
          return;
        }
        onChange(v);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_SENTINEL}>{noneLabel}</SelectItem>
        {items.map((item) => (
          <SelectItem key={item._id} value={item._id}>
            {item.label}
          </SelectItem>
        ))}
        <SelectSeparator />
        <SelectItem value={CREATE_SENTINEL} className="text-primary">
          <Plus className="h-3.5 w-3.5" />
          {createLabel}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectWithCreate;
