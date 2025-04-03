import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, ReceiptText, ExternalLink, ArrowRight } from "lucide-react";
import { MeditationPlayerDialog } from "@/components/player/meditation-player-dialog";

export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-lg my-4">
      <p className="border-border bg-accent/60 text-accent-foreground rounded-lg border px-8 py-5">
        {children}
      </p>
    </div>
  );
}

export function Separator() {
  return <div className="my-4 h-px w-full" />;
}

export function ExternalLinkLine({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <div className="flex justify-center">
      <Link href={href} target="_blank">
        <ExternalLink className="mr-2 inline-block h-4 w-4" />
        {title}
      </Link>
    </div>
  );
}

export function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-muted/50 text-muted-foreground my-4 rounded-lg border p-4">
      <div className="italic">{children}</div>
    </div>
  );
}

export function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-muted/50 text-muted-foreground my-4 rounded-lg border p-4">
      {children}
    </div>
  );
}

export function ChatBotBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-accent/60 text-accent-foreground rounded-lg border px-4">
      {children}
    </div>
  );
}

export function ChatbotResponse({
  content,
  truncateAt = 180,
}: {
  content: string;
  truncateAt?: number;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;

    // Find the last space within the max length
    const lastSpaceIndex = text.substring(0, maxLength).lastIndexOf(" ");

    // If no space found, just cut at maxLength
    return lastSpaceIndex === -1
      ? text.substring(0, maxLength) + "..."
      : text.substring(0, lastSpaceIndex) + "...";
  };

  const truncatedContent = truncateText(content, truncateAt);

  return (
    <ChatBotBox>
      <p className="overflow-hidden whitespace-pre-wrap italic">
        {truncatedContent}
      </p>
      <div className="flex justify-center">
        <Button
          variant="link"
          size="sm"
          className="-ml-2 -mt-2 mb-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <ReceiptText className="h-4 w-4" />
          View full response
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <div className="prose prose-headings:font-normal prose-headings:tracking-tight dark:prose-invert text-muted-foreground max-w-none md:p-4">
            <Markdown>{content}</Markdown>
          </div>
        </DialogContent>
      </Dialog>
    </ChatBotBox>
  );
}

export function PlayButton({ id, title }: { id: string; title: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const meditationId = id;

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="h-auto whitespace-normal py-2 text-center"
      >
        <Play className="hidden h-4 w-4 flex-shrink-0 sm:inline-block" />
        <span>{title}</span>
      </Button>
      <MeditationPlayerDialog
        meditationId={meditationId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

export function PlayButtonLine({ id, title }: { id: string; title: string }) {
  return (
    <div className="mt-6 flex justify-center">
      <PlayButton id={id} title={title} />
    </div>
  );
}
