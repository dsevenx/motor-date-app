// MotorDate Component
export interface MotorDateProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}