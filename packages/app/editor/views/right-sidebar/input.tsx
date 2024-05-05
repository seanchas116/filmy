import { ExplicitInput } from "@/editor/components/explicit-input";
import { MIXED } from "@/utils/mixed";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import tw from "tailwind-styled-components";

export const InputWrap: React.FC<{
  label: ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => {
  return (
    <div className={twMerge("relative h-8", className)}>
      {children}
      <div className="pointer-events-none absolute inset-y-0 left-2 text-[10px] text-gray-400 flex items-center">
        {label}
      </div>
    </div>
  );
};

export const InputBody = tw(
  ExplicitInput
)`bg-gray-100 absolute w-full pl-6 pr-2 h-8 rounded-lg text-xs outline-blue-500`;

export const NumberInput: React.FC<{
  className?: string;
  label: ReactNode;
  value: number | typeof MIXED | undefined;
  onChangeValue?: (value: number) => void;
}> = ({ className, label, value, onChangeValue }) => {
  return (
    <InputWrap label={label} className={className}>
      <InputBody
        value={value === MIXED ? "" : String(value ?? "")}
        placeholder={value === MIXED ? "Mixed" : undefined}
        onChangeValue={(value) => {
          const n = Number(value);
          if (isNaN(n)) {
            return;
          }
          onChangeValue?.(n);
        }}
      />
    </InputWrap>
  );
};
