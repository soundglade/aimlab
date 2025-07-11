import { timeAgo } from "@/lib/time";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { CircleCheckBig, Download } from "lucide-react";
import Link from "next/link";

// CustomLink component for consistent link style
function CustomLink({
  href,
  children,
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  const baseClass =
    "text-primary underline underline-offset-2 transition-colors hover:opacity-80";
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${className}`}
        {...props}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${baseClass} ${className}`} {...props}>
      {children}
    </Link>
  );
}

// Changelog as JSX
export const changelogEntries = [
  {
    title: "Phasing out the Meditation Studio",
    date: "2025-07-07T17:00:00Z",
    description: (
      <>
        We are phasing out the legacy Meditation Studio. You can now save and
        share meditations using the{" "}
        <CustomLink href="/instant">instant player</CustomLink>, so there is no
        need for the Studio anymore.
      </>
    ),
  },
  {
    title: "Save and share instant meditations",
    date: "2025-06-25T18:00:00Z",
    description: (
      <>
        It's now possible to save (privately) and share (publicly) your instant
        meditations. Shared meditations work just like the regular ones created
        with the Meditation Studio. You can edit the title, add a cover image,
        and add a description. A default descriptions is automatically generated
        from the meditation content. All your saved meditations are listed below
        the <CustomLink href="/instant">instant player</CustomLink>.
      </>
    ),
  },
  {
    title: "New instant download",
    date: "2025-06-20T13:00:00Z",
    description: (
      <>
        The <CustomLink href="/instant">instant player</CustomLink> now supports
        instant MP3 downloads, without the need to play the meditation first.
        The download button (
        <Download className="bg-secondary inline-block h-4 w-4 rounded-full" />)
        is on the right side of the play button.
      </>
    ),
  },
  {
    title: "Add support for more languages",
    date: "2025-06-14T15:00:00Z",
    description: (
      <>
        The <CustomLink href="/instant">instant player</CustomLink> now supports
        7 new languages. Each language has its own set of voices. Unfortunately
        the quality of these new voices is... well, so-so! 😅 Sorry about that.
        I've resisted publishing these voices because of their quality, but I'm
        releasing them just in case someone still finds them useful.
      </>
    ),
  },
  {
    title: "New voices for instant player",
    date: "2025-06-12T13:00:00Z",
    description: (
      <>
        It's now possible to chose between 6 different voices for the{" "}
        <CustomLink href="/instant">instant player</CustomLink>.
      </>
    ),
  },
  {
    title: "Download MP3 from instant player",
    date: "2025-06-03T11:00:00Z",
    description: (
      <>
        It is now possible to download the MP3 file of the meditation from the{" "}
        <CustomLink href="/instant">instant player</CustomLink>. The download
        button becomes active when the mp3 is ready, once all the audio files
        have been synthesized.
      </>
    ),
  },
  {
    title: "New focus mode",
    date: "2025-05-16T11:00:00Z",
    description: (
      <>
        The <CustomLink href="/instant">instant player</CustomLink> now supports
        focus mode. In focus mode the player goes full screen and only shows the
        current step.
      </>
    ),
  },
  {
    title: "Auto-improve pauses",
    date: "2025-05-12T17:00:00Z",
    description: (
      <>
        The most requested feature so far: improved default pauses. AI chatbots
        struggle to position and extend pauses appropriately. With this change,
        the instant player can now automatically improve pauses based on
        different criteria. It makes pauses more natural, respecting space for
        breathing and practice instructions.
      </>
    ),
  },
  {
    title: "Highlight featured meditations",
    date: "2025-05-10T14:00:00Z",
    description: (
      <>
        Community meditations with a custom markdown description or cover image
        are now shown at the top of the{" "}
        <CustomLink href="/meditations">meditations page</CustomLink>.
      </>
    ),
  },
  {
    title: "Instant player supports custom ElevenLabs voices",
    date: "2025-04-29T14:00:00Z",
    description: (
      <>
        You can now use your own custom ElevenLabs voices in the{" "}
        <CustomLink href="/instant">instant player</CustomLink>. Use the new
        "Customize" button to add your API key and voice settings.
      </>
    ),
  },
  {
    title: "Instant player published",
    date: "2025-04-25T16:00:00Z",
    description: (
      <>
        The instant player is now live! Instantly listen to your own guided
        meditations. Great for quick experiments and daily practice. Unlike the
        Studio meditations are not public.
      </>
    ),
  },
  {
    title: "New domain: MeditationLab.ai",
    date: "2025-04-25T13:00:00Z",
    description: (
      <>
        We have a new home:{" "}
        <CustomLink href="https://meditationlab.ai">
          MeditationLab.ai
        </CustomLink>
      </>
    ),
  },
  {
    title: "Introducing the weekly newsletter",
    date: "2025-04-25T10:00:00Z",
    description: (
      <>
        Stay up to date with new features and meditations by{" "}
        <CustomLink href="https://newsletter.meditationlab.ai">
          subscribing to our newsletter
        </CustomLink>
      </>
    ),
  },
  {
    title: "Add playback buttons for instant player demo",
    date: "2025-04-22T17:00:00Z",
    description: <>The instant player demo now has playback controls.</>,
  },
  {
    title: "First demo of instant player",
    date: "2025-04-21T12:00:00Z",
    description: (
      <>The first version of the instant player is available for testing.</>
    ),
  },
  {
    title: "Upload meditation cover image",
    date: "2025-04-11T12:00:00Z",
    description: (
      <>
        You can now upload a cover image for your meditations. You can find the
        new option under the Edit menu of the meditation page.
      </>
    ),
  },
  {
    title: "Two new voices available",
    date: "2025-04-11T09:00:00Z",
    description: (
      <>
        Added two new high-quality voices using ElevenLabs v2 for your
        meditations.
      </>
    ),
  },
  {
    title: "Reddit posts displayed on landing page",
    date: "2025-04-08T12:00:00Z",
    description: (
      <>
        Latest Reddit posts from{" "}
        <CustomLink href="https://www.reddit.com/r/AIMeditationLab/">
          r/AIMeditationLab
        </CustomLink>{" "}
        are now shown on the landing page.
      </>
    ),
  },
  {
    title: "Ending bell added to meditation player",
    date: "2025-04-07T12:00:00Z",
    description: (
      <>
        A gentle bell now signals the end of your meditation session. You toggle
        the bell using the mute bell button.
      </>
    ),
  },
];

export function ChangelogList() {
  return (
    <ul className="space-y-8">
      {changelogEntries.map((item, idx) => (
        <li key={idx}>
          <span className="text-muted-foreground whitespace-nowrap text-xs">
            {timeAgo(item.date)}
          </span>
          <div className="mb-1 flex items-center justify-between">
            <span>{item.title}</span>
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
    <div className="absolute left-1/2 mt-1 -translate-x-1/2 flex-col items-center opacity-70 hover:opacity-100">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hover:bg-accent group h-auto w-full justify-start px-3 py-1 transition-colors"
        onClick={() => setDrawerOpen(true)}
      >
        <div className="flex w-full items-center justify-between gap-2 overflow-hidden text-left">
          <span className="text-muted-foreground flex items-center gap-1.5 truncate text-sm font-normal">
            <CircleCheckBig className="mr-1 h-3.5 w-3.5" />
            <span className="hidden md:inline">{latest.title}</span>
          </span>
          <span className="text-muted-foreground hidden whitespace-nowrap text-xs md:inline">
            {timeAgo(latest.date)}
          </span>
        </div>
      </Button>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="mx-auto flex h-[calc(100%-40px)] max-w-2xl flex-col bg-white px-2 dark:bg-gray-900 md:px-6">
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <div className="flex items-center gap-2 text-2xl tracking-tight">
              <CircleCheckBig className="h-5 w-5 opacity-50" />
              Changelog
            </div>
          </div>
          <div className="scrollbar-thin flex-1 overflow-auto px-4 py-4 md:px-4">
            <ChangelogList />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
