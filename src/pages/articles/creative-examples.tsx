import { PostLayout } from "@/components/blog/PostLayout";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ReceiptText } from "lucide-react";
import { MeditationPlayerDialog } from "@/components/player/meditation-player-dialog";

export default function BlogPost() {
  return (
    <PostLayout
      title="Creative examples"
      date="March 30, 2025"
      content={
        <>
          <p>
            Hi there, In this article I'm going to showcase some creative ways
            to generate meditations using AI. I hope this will inspire you to do
            your own experiments.
          </p>

          <h2>Daily meditation in a particular style</h2>

          <p>
            Let's start with a very simple example. I'd like to try to create
            meditation inspired by <b>Sam Harris</b> daily meditations that he
            shares on the Waking Up app. For this example I've used{" "}
            <b>Claude</b> instead of ChatGPT. Without further guidance, it seems
            Claude does a better job at mimicking Sam's style.
          </p>

          <Prompt>
            Can you create for me the script of a guided daily meditation in the
            style of Sam Harris Waking up app? Please add also pause markers
            when appropriate in the format [pause for xx seconds].
          </Prompt>

          <ChatbotResponse content={samHarrisResponse} />

          <PlayButton
            id="76v1bxm"
            title="Play Sam Harris-Inspired Daily Meditation"
          />

          <p>
            I'd say the result is quite interesting. It seems theoratically
            sound, although perhaps the stylistically not so close. Sam doesn't
            usually share so much guidance on posture, for instance. But also,
            the initial focus onbreath reminds more of traditional mindfulness
            instead of non-dual awareness.
          </p>
          <p>Here are some interesting highlights where it gets it right:</p>
          <ul>
            <li>
              <i>
                Notice that everything that appears in your experience – every
                thought, sensation, emotion, and perception – arises and passes
                away within the field of awareness itself.
              </i>
            </li>
            <li>
              <i>
                See if you can rest as this awareness – not as a person having
                experiences, but as the knowing space in which all experiences
                arise and dissolve.
              </i>
            </li>
          </ul>
        </>
      }
    />
  );
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-muted/50 text-muted-foreground my-4 rounded-lg border p-4">
      <div className="italic">{children}</div>
    </div>
  );
}

function ChatbotResponse({ content }: { content: string }) {
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

  const truncatedContent = truncateText(content, 180);

  return (
    <div className="border-border bg-accent/60 text-accent-foreground rounded-lg border px-4">
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
    </div>
  );
}

function PlayButton({ id, title }: { id: string; title: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const meditationId = id;

  return (
    <div className="mt-4 flex justify-center">
      <Button onClick={() => setDialogOpen(true)}>{title}</Button>
      <MeditationPlayerDialog
        meditationId={meditationId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

const samHarrisResponse = `I'll create a guided daily meditation script in a similar style to meditations that focus on mindfulness and present-moment awareness. Here's a meditation script with appropriate pause markers:

---

# Present Moment Awareness Meditation

## Introduction

Let's begin by taking a comfortable seated position. You can sit in a chair with your feet flat on the floor, or cross-legged on a cushion. Allow your spine to be straight but not rigid, embodying a posture that's both alert and relaxed.

[pause for 5 seconds]

Let your hands rest comfortably on your thighs or in your lap. And now, gently close your eyes.

[pause for 5 seconds]

## Settling In

Take a moment to notice the weight of your body against the surface beneath you. Feel the points of contact – where your sitting bones meet the chair or cushion, where your feet touch the floor.

[pause for 10 seconds]

Notice any sounds in your environment. There's no need to identify or label them – just allow them to come and go in your awareness.

[pause for 15 seconds]

## Breath Awareness

Now, bring your attention to the sensation of breathing. Don't try to control your breath in any way – simply observe it as it is.

[pause for 10 seconds]

Notice where you feel the breath most prominently. Perhaps it's the rise and fall of your chest or abdomen. Maybe it's the sensation of air passing through your nostrils.

[pause for 15 seconds]

For the next few moments, simply rest your attention on these sensations of breathing.

[pause for 30 seconds]

## Noticing Thoughts

As you continue to follow your breath, you'll likely notice that thoughts arise in consciousness. This is what minds do – they produce thoughts, just as hearts produce heartbeats.

[pause for 10 seconds]

See if you can notice the appearance of a thought. Where does it come from? What is its nature?

[pause for 20 seconds]

When you notice that your mind has wandered – and it will – simply recognize that fact and gently return your attention to the breath.

[pause for 30 seconds]

## Expanding Awareness

Now, let's expand our awareness beyond the breath. Allow your attention to include sensations throughout your entire body.

[pause for 10 seconds]

Notice any areas of tension or ease, warmth or coolness, heaviness or lightness. There's no need to change anything – just observe these sensations as they appear in consciousness.

[pause for 30 seconds]

## Open Awareness

Now, let's open our awareness even further. Allow everything to be as it is – thoughts, emotions, sensations, sounds – all appearing in the spaciousness of consciousness.

[pause for 10 seconds]

Notice that everything that appears in your experience – every thought, sensation, emotion, and perception – arises and passes away within the field of awareness itself.

[pause for 20 seconds]

See if you can rest as this awareness – not as a person having experiences, but as the knowing space in which all experiences arise and dissolve.

[pause for 45 seconds]

## Being Present

In this moment, you don't need to do anything or be anyone. You can simply rest as awareness itself, naturally present and undisturbed by the contents of experience.

[pause for 30 seconds]

Notice that awareness itself has no form or location. It doesn't come or go. It's always here, always now.

[pause for 20 seconds]

## Closing

As we bring this meditation to a close, recognize that this awareness that you've been resting as is always available to you. You can return to it at any time, in any circumstance.

[pause for 10 seconds]

Gradually, allow your attention to return to the room around you. Notice the weight of your body, the sounds in your environment.

[pause for 10 seconds]

When you're ready, gently open your eyes.

[pause for 5 seconds]

Take a moment to notice how you feel. And remember that the clarity and spaciousness you've contacted is your natural state – always present, beneath the surface of thought.

---

I've created a guided daily meditation script focused on present moment awareness. It begins with settling into the meditation posture, then guides attention to the breath, thoughts, bodily sensations, and finally to awareness itself. The script includes appropriate pause markers indicating when to allow silence for reflection and practice.

The meditation progresses from focused attention on the breath to a more open awareness, helping the practitioner recognize the nature of consciousness as the space in which all experiences arise and pass away. This progression mirrors the approach often found in mindfulness meditations that emphasize both focused attention and open monitoring practices.

Would you like me to make any adjustments to the meditation length, focus, or specific language used?
`;
