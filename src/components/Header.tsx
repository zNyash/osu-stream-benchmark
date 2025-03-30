import { memo } from "react";
import { Button } from "@/components/ui/button";

export const Header = memo(() => (
	<section className="relative flex w-full max-w-[1300px] flex-row md:justify-center">
		<h1 className="mt-2 pt-1.5 pl-3 text-2xl font-medium md:text-4xl">osu! Tapping Benchmark</h1>
		<Button
			variant={"ghost"}
			className="absolute top-3 right-3 cursor-pointer"
			onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
		>
			My Stats
		</Button>
	</section>
));

Header.displayName = "Header";
