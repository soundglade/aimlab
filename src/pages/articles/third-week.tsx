import { PostLayout } from "@/components/blog/PostLayout";
import Markdown from "react-markdown";

export default function BlogPost() {
  return (
    <PostLayout
      title={
        <>
          Instant meditation player, new domain, and surprising AI connections
        </>
      }
      date="April 28, 2025"
      content={
        <>
          <Markdown>{content}</Markdown>
        </>
      }
    />
  );
}

const content = `
What a week it's been for AIM Lab! After the technical focus of last week, I'm glad to share some significant developments that are making our tools more accessible and immediate.

## New Developments

### The instant meditation player is live!

If you haven't seen it yet, go check it out: [https://meditationlab.ai/instant](https://meditationlab.ai/instant)

It may not look like much, and in fact it's a stripped-down and simplified version of the tool we used so far to synthesize meditations. But just because it's so easy and immediate to use, it can open new possibilities.

For once: you can now use it for your daily meditations. Unlike the Studio which is designed for crafting more polished, shareable meditations, the Instant Player lets you quickly generate a practice without the wait or public sharing.

I tested it last week, experimenting with asking ChatGPT to write me a meditation every day, mostly based on my daily journal. I'm amazed by the results (more on that later).

### New domain and newsletter

I've registered a new domain! I felt like AIM Lab needed its own place, separate from SoundGlade. So here we are, you can now find us at [meditationlab.ai](https://meditationlab.ai).

I've also created a newsletter. If you want to receive these weekly updates in your inbox, make sure to [subscribe](https://newsletter.meditationlab.ai/).

## 7-days of meditations with ChatGPT

I've completed my little challenge of meditating everyday with ChatGPT. I really liked it, and in fact, I'm likely to keep doing it.

### The power of personal context

What was special about using ChatGPT is that the meditations were tailored to my journal. I use ChatGPT to journal at the end of each day, to review my day and check how my day unfolded, compared with my morning intentions.

This is a great practice of self-awareness, but it also gave ChatGPT plenty of context to know how I was feeling and what was going on in my life. That's why the meditations were truly unique.

### Creative techniques beyond standard mindfulness

I was impressed by ChatGPT's creativity and skills in crafting meditation scripts. These meditations weren't just your usual mindfulness practice: they incorporated all sorts of other techniques, borrowing from internal family systems parts-work, visualizations, and guided inquiry.

And what a beautiful guidance!

### Some of my favorite moments:

>Feel all these parts existing together.
>There's no need to resolve them.
>Just hold them in the same field.
>Let your breath move through the space between them.

>Imagine the ground beneath you widening.
>Like the earth itself saying: "I've got you."
>Feel the invitation to lean back — not into laziness, but into trust.
>Trust that the seeds you've planted are real.
>Trust that the river knows how to flow.

>Let this meditation end gently, like a leaf settling on water.
>No hard stop.
>Just a soft presence carrying you into the next beat of your life.

>Sense the threshold you now stand at —
>a gentle doorway between what has been
>and what will come.
>Simply feel yourself resting at the threshold —
>trusting that when the time comes to step forward, you will.

## Shavas AI and a surprising meditative experience

On Wednesday I had the pleasure to "double" my daily dose of AI meditation. I spent some time testing a new app, [Shavas AI](https://shavas.ai/).

### The unexpected human connection

Testing a 10-minute guided meditation, I was quite surprised by how the experience felt.

You may think that AI meditations would feel cold, robotic, synthetic, fake, but my perception was exactly the opposite.

Not only did the voice feel very human, but it felt more personal, more connected, than your usual meditation. Because the script was personalized based on my request, but mostly, because it talked directly to me, even referencing me by my name.

This really surprised me. It echoes what many of us have already felt with generative AI, such with ChatGPT, that experience of sensing a deep emotional connection. This is quite the opposite of what one would expect from a "robot".

### The human touch behind AI

And I wonder if one of the reasons is that actually, behind it, there is a human being, a human being who designed the app, who chose the voice, who made subtle decisions (such as timing, speed, intonation).

I am more and more convinced that empathy and even elusive concepts such as soulfulness can be felt in the product of our creativity, even when that product is inorganic, synthetic, artificial.

Imagine entering a new room: what can you sense? How does that space make you feel? What does that tell you about the person who cared for that space? A room is just a collection of inanimate objects, and still it carries the creative spirit of the people who architected, furnished it, and cared for it.

What do you think? Have you experienced this unexpected sense of connection with AI-generated content? Does it challenge your assumptions about what makes an experience "human"?

## Looking forward

As we continue exploring this fascinating intersection of AI and meditation, I'm excited to see how the community uses the new instant meditation player. Will you create daily personalized practices? Will you experiment with different styles or techniques? I'm curious to hear about your experiences!

The surprise emotional connection I felt from AI-generated meditations has me thinking about deeper questions: How do we perceive presence and connection? What elements make a meditation feel personal and meaningful?

I'd love to hear your thoughts, experiences, and any ideas you have for future developments. Feel free to share in the comments, join us on Reddit, or reach out directly.

Thank you for being part of this growing community. May your practice be nourishing, whether AI-assisted or not!

🙏
`;
