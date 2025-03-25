"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Clock, MousePointerClick } from "lucide-react";
import { useRef, useState } from "react";

export default function Home() {
  const [value1, setValue1] = useState<string>("Z");
  const [value2, setValue2] = useState<string>("X");
  const inputRef1 = useRef<HTMLInputElement>(null!);
  const inputRef2 = useRef<HTMLInputElement>(null!);

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    defaultValue: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    if (e.target.value === "") setValue(defaultValue);
  };
  const handleFocus = (ref: React.RefObject<HTMLInputElement>) =>
    ref.current?.select();

  return (
    <>
      <div className="flex flex-col items-center mb-12">
        <section className="relative flex w-full max-w-[1300px] md:justify-center flex-row">
          <h1 className="mt-2 text-2xl pl-3 pt-1.5 md:text-4xl font-medium">osu! Tapping Benchmark</h1>
          <Button variant={"ghost"} className="absolute top-3 right-3 cursor-pointer">
            My Stats
          </Button>
        </section>

        <section className="section mt-24">
          <div className="flex flex-col">
            <Label className="gap-1">
              Stop at __ <span className="text-foreground/50 m-0 p-0">clicks</span>
              / seconds
            </Label>
            <div className="flex">
              <Input type="number" min={3} className="input rounded-r-none" />
              <ToggleGroup type="single" variant="nsh">
                <ToggleGroupItem
                  value="Clicks"
                  className="first:rounded-l-none"
                >
                  <MousePointerClick />
                </ToggleGroupItem>
                <ToggleGroupItem value="Seconds" className="">
                  <Clock />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </section>

        <section className="section mt-2">
          <div>
            <p>Choose your keybinds:</p>
            <div className="flex flex-row justify-center gap-1">
              <input
                type="text"
                maxLength={1}
                className="input size-9 rounded-md border text-center align-top leading-none"
                value={value1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValue1(e.target.value.toUpperCase())
                }
                onBlur={(e) => handleBlur(e, "Z", setValue1)}
                onFocus={() => handleFocus(inputRef1)}
                ref={inputRef1}
              />
              <input
                type="text"
                maxLength={1}
                className="input size-9 rounded-md border text-center align-top leading-none"
                value={value2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValue2(e.target.value.toUpperCase())
                }
                onBlur={(e) => handleBlur(e, "X", setValue2)}
                onFocus={() => handleFocus(inputRef2)}
                ref={inputRef2}
              />
            </div>
          </div>
        </section>

        <section className="mt-12 section text-6xl font-bold">
          <div className="flex flex-col items-center">
            <p>274 BPM</p>
            <Button className="mt-4 bg-sky-600 hover:bg-sky-600/75 cursor-pointer text-foreground">Start Benchmark</Button>
          </div>
        </section>

        <section className="section mt-20">
          <div className="flex flex-col items-center">
            <p>0 clicks / 0.00s</p>
            <p>0 UR</p>
            <div className="aspect-video w-100 rounded-md bg-zinc-900 mt-4">

            </div>
          </div>
        </section>
      </div>
    </>
  );
}
