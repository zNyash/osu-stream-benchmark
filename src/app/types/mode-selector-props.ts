export interface ModeSelectorProps {
  mode: {
    mode: "clicks" | "seconds";
    clicksValue: number;
    secondsValue: number;
  };
  handleValueChange: (value: number) => void;
  handleModeChange: (mode: "clicks" | "seconds") => void;
}