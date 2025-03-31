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

import { Box, ReceiptText } from "lucide-react";
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

          <p>Let's start with a very simple example.</p>

          <Prompt>
            Can you create for me the script of a brief guided daily meditation
            that explores <b>non-duality and direct awareness</b> using secular,
            precise language? Please add also pause markers when appropriate in
            the format [pause for xx seconds].
          </Prompt>

          <ChatbotResponse content={dailyMeditationResponse} />

          <PlayButton
            id="dra65y7"
            title="Play Awareness and Non-Duality Meditation"
          />

          <p>
            What do you think of the result? I'm personally quite impressed.
            It's well structured and well timed, and most importantly, it is
            faithful to the meditation style requested. It's interesting to see
            how much knowledge of meditative traditions is already present in
            chatbots.
          </p>

          <h2>Remixing a favourite meditation</h2>

          <p>
            In this and following experiments we'll explore altering
            ("remixing") existing meditations. The basic idea is simple:{" "}
            <b>
              find a way to obtain a script of the original meditation, then use
              chatbots to alter it.
            </b>
          </p>

          <p>
            What are the ethical implications of this? This is an interesting
            question that experiments like this starts to pose. We'll see how
            it's fairly easy to clone and adapt existing meditations.
          </p>

          <p>
            For this experiment I'm going to use Loch Kelly's latest guided
            meditation from his YouTube channel.
          </p>

          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/it38xrSZUWc?si=xcdERcq5T02hRWfU"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <p>
            To create this prompt I've downloaded the transcript from YouTube
            and attached it to the message.
          </p>
          <Prompt>
            I attach the transcript of a guided meditation I like. Can you
            create a new meditation script based on this meditation, expanding
            each section proportionally so the final result is approximately
            twice as long as the original? Keep the language and style as close
            as possible to the original. Add headings and appropriate pause
            markers in the format [pause for xx seconds] throughout.
          </Prompt>

          <ChatbotResponse content={lockKellyResponse} />

          <PlayButton
            id="lenf5p7"
            title="Play Effortless Mindfulness and Limitless Awareness"
          />

          <p>
            The final meditation is definetely longer (although more tripled
            than doubled) and it follows the style of guidance faithfully.
          </p>

          <p>
            Here is an example of how the chatbot expanded the guidance. This is
            the original first part.
          </p>

          <Box>
            Find a comfortable way of sitting. Become aware of your breath in
            either your chest or your belly as it rises and relaxes. Focus your
            attention there at this one area. When your mind wanders simply
            bring it back to the simple one-pointed focus in your body as your
            breath rises and relaxes.
          </Box>

          <p>
            And this is how the chatbot edited the script. Notice how it both
            added more pauses and new guidance (I formatted in bold the new
            text).
          </p>

          <ChatBotBox>
            <Markdown>
              {`
Find a comfortable way of sitting. **Allow your body to settle into a position that feels natural and supportive.**

_[pause for 10 seconds]_

Become aware of your breath in either your chest or your belly as it rises and relaxes. **Simply notice the natural rhythm without trying to change it.**

_[pause for 5 seconds]_

Focus your attention there at this one area. Let your awareness rest gently on this single point of focus in your body as your breath rises and relaxes.

_[pause for 10 seconds]_

When your mind wanders, **as minds naturally do**, simply bring it back to this simple one-pointed focus in your body. **No judgment, just a gentle return** to the breath as it rises and relaxes.
`}
            </Markdown>
          </ChatBotBox>
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

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-muted/50 text-muted-foreground my-4 rounded-lg border p-4">
      {children}
    </div>
  );
}

function ChatBotBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-accent/60 text-accent-foreground rounded-lg border px-4">
      {children}
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

function PlayButton({ id, title }: { id: string; title: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const meditationId = id;

  return (
    <div className="mt-6 flex justify-center">
      <Button onClick={() => setDialogOpen(true)}>{title}</Button>
      <MeditationPlayerDialog
        meditationId={meditationId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

const dailyMeditationResponse = `# Daily Non-Dual Awareness Meditation

I've created a brief daily meditation script focusing on non-duality and direct awareness, using secular and precise language. The meditation guides you through:

1. Beginning with bodily relaxation and breath awareness
2. Expanding attention to include physical sensations
3. Shifting attention from experiences to awareness itself
4. Exploring the non-dual nature of awareness and experience
5. Resting as awareness without effort
6. Reconnecting with ordinary activity while maintaining awareness

The script includes appropriate pause markers at natural transition points to allow for integration of each section. You can adjust the pause durations based on your preference for a shorter or longer meditation session.

Would you like me to modify any aspects of the script, such as the length, specific language, or focus areas?

---
## Beginning

Find a comfortable position where your body can be at ease. You may sit or lie down, whatever allows you to be both alert and relaxed. Allow your eyes to close gently. [pause for 10 seconds]

Take three deep breaths, inhaling slowly through your nose and exhaling fully through your mouth. With each exhale, feel your body settling more deeply into its support. [pause for 15 seconds]

## Attention to Sensations

Now, bring your attention to the sensations of breathing. Notice the natural rhythm of your breath without trying to control it. Simply observe the rising and falling sensations. [pause for 20 seconds]

As you continue to breathe naturally, expand your awareness to include all physical sensations throughout your body. Notice the points of contact where your body touches its support. Feel the temperature of the air on your skin. [pause for 15 seconds]

## Noticing Awareness Itself

Now, gently shift your attention from what you're experiencing to the awareness that is experiencing it. Notice that there is an awareness that is cognizant of all sensations, thoughts, and emotions. [pause for 20 seconds]

This awareness itself has no form, no location, no boundary. It is simply present, open, and cognizant. Rest in the recognition that this awareness is what you fundamentally are. [pause for 30 seconds]

## Exploring Non-Duality

Notice that within this awareness, experiences arise and pass away. Sensations, sounds, thoughts – all appear within this field of knowing. [pause for 15 seconds]

Is there a separation between the awareness and what is being aware of? Can you find where awareness ends and experience begins? [pause for 20 seconds]

Notice that what we conventionally call "inside" and "outside" are both appearing within this same borderless awareness. The sound of a distant car, the sensation in your hand, the thought in your mind – all are equally appearances within this single field of knowing. [pause for 30 seconds]

## Resting as Awareness

Allow all effort to relax. You don't need to hold onto or push away any experience. Simply rest as the awareness within which all experiences come and go. [pause for 25 seconds]

Notice that awareness itself is effortlessly present. It doesn't come and go. It doesn't require maintenance. It is naturally present, naturally knowing. [pause for 20 seconds]

## Being and Doing

As we come to the end of this meditation, recognize that this awareness is not something you've created or achieved. It's what you already are and have always been – the knowing presence within which your entire life unfolds. [pause for 15 seconds]

When you're ready, gently allow your attention to include the space around you. Feel free to move your fingers and toes, and when you feel complete, open your eyes. [pause for 10 seconds]

As you move through your day, see if you can occasionally recognize this same awareness that is always here, always knowing – the foundation of all experience.

`;

const lockKellyResponse = `I'll create an expanded meditation script based on the transcript you provided, while maintaining the style and flow of the original. I'll add section headings and pause markers to guide the timing.

I've created an expanded meditation script based on the transcript you provided. It maintains the same style, flow, and progressive movement of awareness through different parts of the body, but extends each section proportionally to make it approximately twice as long.

The script includes:
- Clear section headings to guide the practice
- Pause markers throughout (in the format [pause for xx seconds])
- The same gentle, instructive language style as the original
- The core progression from focused attention to expanded awareness

The meditation preserves the key elements from the original:
- Beginning with breath focus
- Noticing the observer position
- Moving awareness through the body
- Expanding to spacious awareness
- Discovering "already awake awareness"
- Experiencing simultaneous awareness of different dimensions
- Ending with effortless mindfulness

You can access the full meditation script in the document. Would you like me to explain any particular section in more detail?

---

# Expanded Clear Your Mind Guided Meditation
*Inspired by Loch Kelly's Effortless Mindfulness*

## Finding Comfort and Breath Awareness

Find a comfortable way of sitting. Allow your body to settle into a position that feels natural and supportive. [pause for 10 seconds]

Become aware of your breath in either your chest or your belly as it rises and relaxes. Simply notice the natural rhythm without trying to change it. [pause for 5 seconds]

Focus your attention there at this one area. Let your awareness rest gently on this single point of focus in your body as your breath rises and relaxes. [pause for 10 seconds]

When your mind wanders, as minds naturally do, simply bring it back to this simple one-pointed focus in your body. No judgment, just a gentle return to the breath as it rises and relaxes. [pause for 15 seconds]

## Noticing the Observer

Now as you're focusing on your breath at that area, feel the area from which you are focusing. Notice where in your body this observation seems to be happening from - usually somewhere in your head, behind your eyes. [pause for 10 seconds]

Take a moment to notice both the place where the breath is rising and the place from which the focusing is happening. Two distinct areas - the observed and the observer. [pause for 10 seconds]

Without needing to know exactly how you're doing it, feel as if you can unhook local awareness from the area from which you're focusing. There's no effort needed, just a gentle releasing. [pause for 15 seconds]

## Dropping Awareness

Feel local awareness like an invisible bubble of knowing. A small sphere of consciousness that can move on its own. Allow it to begin to drop downward through your head. [pause for 10 seconds]

First, know your jaw directly from within your jaw. Feel your jaw from the awareness within your jaw, as if the subject and object are located in the same place. Experience what it's like when awareness is within what it's aware of. [pause for 15 seconds]

Now notice that local awareness can move on its own to become aware of your throat directly from within your throat. [pause for 10 seconds]

Notice that you're not stretching attention down from your head to your throat. Instead, awareness itself has relocated. You're experiencing your throat from within your throat. [pause for 10 seconds]

Notice that you don't need to go back up to thought to know that you're aware of your throat from within your throat. Awareness knows itself directly, without the mediation of thinking. [pause for 15 seconds]

Just be aware of your throat from your throat - feeling the space, the aliveness, and the awareness in this one area. [pause for 10 seconds]

## Awareness in the Body

Now feel local awareness move on its own, dropping down below your neck to become aware of your chest. Let awareness settle in this new location. [pause for 10 seconds]

Become aware of your breath directly from within your chest or belly. Feel the rising and relaxing directly from where it's happening. Experience the breath from the inside out. [pause for 15 seconds]

Feel what it's like when the focusing and the focused are happening in the same place. Notice how different this is from observing your body from your head. [pause for 10 seconds]

Notice that the breath is happening by itself. You don't need to make it happen. It flows naturally, without effort, rising and falling in its own rhythm. [pause for 10 seconds]

And similarly, awareness is happening by itself. You don't need to create awareness - it's already present, already knowing. [pause for 15 seconds]

## Expanding Awareness

Let local awareness stay with the breath as awareness energy begins to open. Feel it expanding beyond the single point of focus. [pause for 10 seconds]

Allow this awareness to open to the spacious awareness outside and within your whole body. Feel it spreading like water filling every available space. [pause for 15 seconds]

Experience how this awareness can be both focused and expansive at the same time. It remains connected to the breath while also knowing the entirety of your being. [pause for 10 seconds]

When you're ready, become aware of the space in the room around you from the space in the room itself. Not looking at the room from your body, but experiencing the room from the awareness that permeates the room. [pause for 15 seconds]

## Discovering Limitless Awareness

Continue to let awareness open until it discovers the feeling of an already awake awareness that is both spacious and pervasive. [pause for 10 seconds]

Feel this awareness within your body, but not confined by your body. Experience your body like a seamless field of already awake awareness energy. [pause for 15 seconds]

Become aware of this limitless space of timeless, boundless, awake awareness. Notice how it has no edges, no beginning, and no end. It simply is - open, clear, and ever-present. [pause for 20 seconds]

Experience how this awareness isn't something you need to create or maintain. It's already here, already awake, already knowing. You're simply recognizing what has always been present. [pause for 15 seconds]

## Simultaneous Awareness

Notice that as you remain spacious and limitless, you can simultaneously be intimately aware of the arising awareness energy in your body. [pause for 10 seconds]

Feel the awareness in the room and directly from your breath arising at the center of your body. Multiple locations of knowing happening all at once. [pause for 15 seconds]

Notice that you're simultaneously aware from the limitless space, the energetic field, and your human body. All of these dimensions of experience are available to you at once. [pause for 15 seconds]

Experience how you can be in both the infinite and the particular at the same time. The vastness of open awareness and the specificity of bodily sensations co-existing without conflict. [pause for 15 seconds]

## Effortless Focus

Notice that you can be effortlessly focused on your breath from awake awareness without being distracted. There's no struggle to maintain attention - awareness naturally knows what's arising. [pause for 15 seconds]

Feel the calm, focus, clarity, and well-being that emerges from this effortless mindfulness. [pause for 10 seconds]

Experience how different this is from concentrated focus. Instead of narrowing attention, you're resting in an open awareness that naturally includes the breath without excluding anything else. [pause for 15 seconds]

Allow yourself to rest in this effortless mindfulness. Nothing to do, nowhere to go, simply being the awareness that you already are. [pause for 20 seconds]

## Resting in Awareness

As we bring this meditation to a close, continue to rest in this open, clear awareness. [pause for 10 seconds]

Notice how this awareness is always available to you. It's not something that meditation creates - it's what meditation reveals. [pause for 15 seconds]

When you're ready, you may slowly open your eyes while maintaining this sense of effortless awareness. Notice that opening the eyes doesn't change the fundamental nature of awareness - it simply includes more within its embrace. [pause for 15 seconds]

Carry this effortless mindfulness with you as you return to your day, knowing you can reconnect with this natural awareness at any time. [pause for 10 seconds]
`;
