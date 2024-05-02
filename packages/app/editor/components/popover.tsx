import React from "react";
import * as Popover from "@radix-ui/react-popover";
import tw from "tailwind-styled-components";

export const PopoverContent = tw(Popover.Content)`
  bg-white rounded-lg overflow-hidden border border-rera-gray-200 text-xs text-gray-900 shadow-xl p-3
`;

export const PopoverArrowContent = React.forwardRef<
  React.ElementRef<"svg">,
  React.ComponentProps<"svg">
>((props, ref) => {
  return (
    <svg
      ref={ref}
      {...props}
      width="16"
      height="8"
      viewBox="0 0 16 8"
      style={{
        transform: "translateY(-1px)",
      }}
    >
      <path d="M0,0 L8,8 L16,0" className="fill-white stroke-rera-gray-200" />
    </svg>
  );
});
PopoverArrowContent.displayName = "PopoverArrowContent";

export const PopoverArrow = () => {
  return (
    <Popover.Arrow asChild>
      <PopoverArrowContent />
    </Popover.Arrow>
  );
};
