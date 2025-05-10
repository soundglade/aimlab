import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { MeditationPlayerDialog } from "./meditation-player-dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Meditation } from "@/components/types";
import { MeditationHeader } from "./meditation-header";
import { cn } from "@/lib/utils";
import { MarkdownDescription } from "@/components/ui/markdown-description";

interface MeditationSummaryProps {
  meditationId: string;
  meditation: Meditation;
  audioUrl: string;
  embedded?: boolean;
}

const MAX_URL_LENGTH = 50;

const CustomLink = ({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  let linkText = children;

  if (
    Array.isArray(children) &&
    children.length === 1 &&
    typeof children[0] === "string" &&
    children[0] === href &&
    href.length > MAX_URL_LENGTH
  ) {
    linkText = `${href.substring(0, MAX_URL_LENGTH)}...`;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {linkText}
    </a>
  );
};

export function MeditationSummary({
  meditationId,
  meditation,
  audioUrl,
  embedded,
}: MeditationSummaryProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <MeditationHeader
        meditation={meditation}
        meditationId={meditationId}
        audioUrl={audioUrl}
        embedded={embedded}
      />
      <Card className="max-w-xl2 mx-auto p-6 md:-mt-5">
        {meditation.coverImageUrl && (
          <img
            src={meditation.coverImageUrl}
            alt="Cover"
            className="mx-auto mt-2 block max-h-[500px] rounded-lg"
          />
        )}
        {meditation.description && (
          <MarkdownDescription content={meditation.description} />
        )}
      </Card>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={() => setDialogOpen(true)} className="gap-2">
          <Play className="h-5 w-5" />
          Play Meditation
        </Button>
      </div>

      <MeditationPlayerDialog
        meditationId={meditationId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        minimal={true}
      />
    </>
  );
}
