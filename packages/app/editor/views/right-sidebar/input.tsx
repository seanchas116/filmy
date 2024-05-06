import { ExplicitInput } from "@/editor/components/explicit-input";
import { usePointerLockDrag } from "@/editor/components/use-pointer-lock-drag";
import { MIXED } from "@/utils/mixed";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import tw from "tailwind-styled-components";

export const InputWrap: React.FC<{
  label: ReactNode;
  children: React.ReactNode;
  className?: string;
  labelRef?: React.RefObject<HTMLDivElement>;
}> = ({ label, children, className, labelRef }) => {
  return (
    <div className={twMerge("relative h-8", className)}>
      {children}
      <div
        ref={labelRef}
        className="absolute inset-y-0 left-2 text-[10px] text-gray-400 flex items-center cursor-ew-resize"
      >
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
  const draggableRef = usePointerLockDrag(
    typeof value === "number" ? value : 0,
    onChangeValue ?? (() => {})
  );

  return (
    <InputWrap label={label} className={className} labelRef={draggableRef}>
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
