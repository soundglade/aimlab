import { timeAgo } from "@/lib/time";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Megaphone } from "lucide-react";

// Changelog as JSX
export const changelogEntries = [
  {
    title: "Instant player supports custom ElevenLabs voices",
    date: "2025-04-29T14:00:00Z",
    description: (
      <>
        You can now use your own <b>custom ElevenLabs voices</b> in the instant
        player. Just add your API key and voice ID in the settings!
      </>
    ),
  },
  {
    title: "Instant player published",
    date: "2025-04-25T16:00:00Z",
    description: (
      <>
        The instant player is now live! Instantly listen to your own guided
        meditations with AI voices.
      </>
    ),
  },
  {
    title: "New domain: meditationlab.ai",
    date: "2025-04-25T13:00:00Z",
    description: (
      <>
        We have a new home:{" "}
        <a
          href="https://meditationlab.ai"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          meditationlab.ai
        </a>
      </>
    ),
  },
  {
    title: "Introduce newsletter",
    date: "2025-04-25T10:00:00Z",
    description: (
      <>
        Stay up to date with new features and meditations by subscribing to our
        newsletter.
      </>
    ),
  },
  {
    title: "Add playback buttons for instant reader",
    date: "2025-04-22T17:00:00Z",
    description: (
      <>
        The instant reader now has playback controls for a smoother listening
        experience.
      </>
    ),
  },
  {
    title: "First draft of instant reader",
    date: "2025-04-21T12:00:00Z",
    description: (
      <>The first version of the instant reader is available for testing.</>
    ),
  },
  {
    title: "Upload meditation cover image",
    date: "2025-04-11T12:00:00Z",
    description: <>You can now upload a cover image for your meditations.</>,
  },
  {
    title: "Two new voices available",
    date: "2025-04-11T09:00:00Z",
    description: <>Added two new high-quality voices for your meditations.</>,
  },
  {
    title: "Reddit posts displayed on landing page",
    date: "2025-04-08T12:00:00Z",
    description: (
      <>
        Latest Reddit posts are now shown on the landing page for inspiration.
      </>
    ),
  },
  {
    title: "Ending bell added to meditation player",
    date: "2025-04-07T12:00:00Z",
    description: (
      <>A gentle bell now signals the end of your meditation session.</>
    ),
  },
];

export function ChangelogList() {
  return (
    <ul className="space-y-6">
      {changelogEntries.map((item, idx) => (
        <li key={idx} className="border-b pb-4 last:border-b-0 last:pb-0">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-base font-medium">{item.title}</span>
            <span className="text-muted-foreground whitespace-nowrap text-xs">
              {timeAgo(item.date)}
            </span>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed">
            {item.description}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Changelog({ show }: { show: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const latest = changelogEntries[0];

  if (!show) return null;

  return (
    <div className="absolute left-1/2 mt-1 hidden -translate-x-1/2 flex-col items-center opacity-70 hover:opacity-100 md:flex">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hover:bg-accent group h-auto w-full justify-start px-3 py-1 transition-colors"
        onClick={() => setDrawerOpen(true)}
      >
        <div className="flex w-full items-center justify-between gap-2 overflow-hidden text-left">
          <span className="text-muted-foreground flex items-center gap-1.5 truncate text-sm font-normal">
            <Megaphone className="mr-1 h-3.5 w-3.5" />
            {latest.title}
          </span>
          <span className="text-muted-foreground whitespace-nowrap text-xs">
            {timeAgo(latest.date)}
          </span>
        </div>
      </Button>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="mx-auto flex h-[calc(100%-40px)] max-w-4xl flex-col bg-white p-0 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Megaphone className="h-5 w-5" />
              Changelog
            </div>
          </div>
          <div className="flex-1 overflow-auto px-4 py-4">
            <ChangelogList />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
