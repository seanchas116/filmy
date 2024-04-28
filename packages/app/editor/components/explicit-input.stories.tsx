import { ExplicitInput } from "./explicit-input";
import { useState } from "react";

export default {
  component: ExplicitInput,
};

export function Basic() {
  const [value, setValue] = useState("initial value");

  return (
    <div>
      <div>{value}</div>
      <ExplicitInput value={value} onChangeValue={setValue} />
    </div>
  );
}
