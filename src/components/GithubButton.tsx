import { memo } from "react";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";

export const GithubButton = memo(() => (
	<Button
		className="text-foreground fixed right-2 bottom-2 cursor-pointer rounded-md bg-zinc-800 hover:bg-zinc-800/75"
		onClick={() => window.open("https://github.com/zNyash/osu-stream-benchmark")}
	>
		<FaGithub />
		Repository
	</Button>
));

GithubButton.displayName = "GithubButton";
