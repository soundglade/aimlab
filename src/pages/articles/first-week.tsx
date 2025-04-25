import { PostLayout } from "@/components/blog/PostLayout";
import Markdown from "react-markdown";

export default function BlogPost() {
  return (
    <PostLayout
      title={
        <>
          100 meditators, becoming-animal,
          <br className="hidden md:block" />
          and Shinzen Young: what a week!
        </>
      }
      date="April 14, 2025"
      content={
        <>
          <Markdown>{content}</Markdown>
        </>
      }
    />
  );
}

const content = `So many things happened last week! [r/AIMeditationLab](https://www.reddit.com/r/AIMeditationLab/) reached 100 users, you created many new and interesting meditations, new features, and sparked interesting discussions.

Let's review it all, and maybe share some ideas for the future.

## Community

Quite happy to see this [r/AIMeditationLab](https://www.reddit.com/r/AIMeditationLab/) reached 100 users! I've never moderated a sub before, and it's great to see there is interest.

Many of you also started experimenting. I want to highlight some of the meditations you created:

[Becoming-Animal Meditation](https://meditationlab.ai/m/pngvpwi) – a fascinating blend of post-structuralist philosophy and contemplative practice

>Let the word human soften. Let it loosen its grip on you. What remains when "human" fades? What flickers underneath?

[Focusing on Developing Non-Self](https://meditationlab.ai/m/vfo9ipk) – a rich blend of traditional mindfulness, non-self inquiry, and compassion

>So what remains? Just awareness. Not your awareness… just knowing. Impersonal. Spacious. Unclinging. Let awareness rest in itself. No center. No boundary. Just this open field, where life unfolds.

[The Detective of You](https://meditationlab.ai/m/o53jyxp) – an intriguing and creative inquiry into selfhood

>Welcome! Today, you're going to be a detective—not chasing clues in a far-off city, but solving the most fascinating mystery of all: who you really are.

I'm really impressed by the creativity and depth. Thanks to everyone who contributed! It's truly inspiring. If you haven't shared one yet, feel free to jump in. 🙏

## Awakin.ai

Last week I discovered [Awakin.ai](http://Awakin.ai): a set of AI chatbots trained to guide users through different spiritual practices. Unlike general bots like ChatGPT, their answers include source references, which makes them more trustworthy. Some highlights: [Compassion Bot](https://www.awakin.ai/compassion/ask), [Ask Headless](https://www.awakin.ai/headless/ask), [SharonBot](https://www.awakin.ai/sharon/ask), and the [BatGapBot](https://www.awakin.ai/batgap/ask).

I played with the Headless Bot to generate guided meditations and was impressed by its creative potential. They're not just repeating pre-written content, they can generate new creative material. For example, I asked it to list 10 Headless Way meditations, picked one, then asked it to script it with pauses. I used AIM Lab to synthesize it (here it is: [Headless Mirror Meditation](https://meditationlab.ai/m/5h5nly3)). That's a whole new creative workflow.

## Shinzen Young and a bottom-up revolution

Thanks to one of your comments I discovered [an interview with Shinzen Young on the Deconstructing Yourself podcast about AI](https://deconstructingyourself.com/can-you-learn-meditation-from-an-ai-with-shinzen-young.html). It's definitely worth listening to. Shinzen is really enthusiastic about the potential for AI to support teaching awakening.

Will these chatbots make mistakes? Sure! But, Shinzen puts it bluntly, don't human meditation teachers make mistakes too? And as anyone who has used ChatGPT knows, at least there are no risks of power trips or sexual abuse... 🙈

What struck me most wasn't so much what Shinzen said as what it made me notice: I'm personally excited by something different.

One of the most unusual aspects of the ChatGPT revolution is that it's been a bottom-up revolution: users started using it before institutions and companies, and they are still catching up. How could a bottom-up (or horizontal, perhaps) revolution apply to meditation? That's what fascinates me: the potential to democratize meditation, to cross-pollinate ideas between meditators, and to let new things emerge... Ok, I'm getting a bit lost in my dreams here. 😅

## Features and glitches

Last week was packed with new features for AIM Lab.

You can now add a **description** and even a **cover image** for each meditation. I like asking ChatGPT "Can you write me a description for this meditation using Markdown?". I also enjoyed crafting cover images using ChatGPT's new imagegen, a creative new way to relate to a meditation. Here is [an example of an image for a meditation on equanimity](https://meditationlab.ai/m/nldggl9).

I've introduced two new voices for the Meditation Studio. These are slightly more expressive than the existing one, as they use ElevenLabs V2. You can read more about it in [this post](https://www.reddit.com/r/AIMeditationLab/comments/1jwn2oi/new_voices_for_meditation_composer/).

As some of you pointed out, sometimes ElevenLabs voices speed up in random ways. It's kind of hilarious, but it also ruins the experience a bit. I've found this to be a common problem, often reported on r/ElevenLabs. I may take a deeper look into this to see if there are workarounds.

## What's next?

This week I'm thinking of focusing mostly on building a new tool, beyond the Meditation Studio. The studio is great when you want to craft a high-quality meditation, to share or store. But wouldn't it be great if there were a simpler way to just "play" a meditation script? Kind of like an instant meditation script reader.

There are some technical challenges involved, but I've got some ideas that may just work... I'll let you know how it goes.

## Feedback!

And you? What would you like to see? What are you curious about?  
What isn't working? What new possibilities are you dreaming about?

[Let me know in the comments.](https://www.reddit.com/r/AIMeditationLab/comments/1jyxhze/100_meditators_becominganimal_and_shinzen_young/)

Thanks again for joining this community!

🙏
`;
