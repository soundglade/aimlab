import { PostLayout } from "@/components/blog/PostLayout";
import Markdown from "react-markdown";

export default function BlogPost() {
  return (
    <PostLayout
      title={
        <>
          Instant meditation reader, multilingual practices,
          <br className="hidden md:block" />
          and a 7-day challenge: week two updates.
        </>
      }
      date="April 21, 2025"
      content={
        <>
          <Markdown>{content}</Markdown>
        </>
      }
    />
  );
}

const content = `Last week was very different from the first one: way less community engagement, more technical work. Most of my focus was on developing the [Instant Meditation Reader](https://meditationlab.ai/reader), and I'm super happy with how it's been coming along.

When I started looking at it on Monday I wasn't even sure if it was feasible, but by the end of the week I had a workable version.

There were a few stubborn issues (including a glitch on iPhone playback) but I'm glad I managed to sort them all out. There are still so many features missing, but now the core architecture is in place.

Let's list other interesting updates.

## Multi-lingual meditations

We've got new interesting meditations this week! Feel free to explore them: [https://meditationlab.ai/meditations](https://meditationlab.ai/meditations)

We had our first non-English meditation: a breath-awareness practice in Russian.  
I'm pleasantly surprised that there is interest in meditations in other languages. This is, after all, another great advantage of using AI.

If you are planning to create meditations in other languages feel free to experiment using the first 3 voices. All those (except for Nicole) are ElevenLabs multilingual voices, and support about 30 languages.

## Private and personal meditations

Someone last week published a meditation that contained some personal details. I've hidden the meditation from the landing page, but please remember that all meditations created using the Studio are public!

But this made me also reflect how not having the possibility to have private, personal meditations is defeating one of the main benefits of AI meditations.

That's why I've decided to keep the Instant Meditation Reader generations private. So you can use that for your own meditations that you don't want to share.

## A 7-days meditation challenge

As the new reader is coming along I thought it'd be a good idea for me to test it daily. And so I thought: why not make it a public 7-days challenge? So here we are! I've posted [all the details here](https://www.reddit.com/r/AIMeditationLab/comments/1k4a8o2/join_me_for_a_7day_ai_meditation_challenge/). Feel free to join along.

## A collective art project?

Finally, I'd like to share some more general reflections. As AIM Lab is coming along, I'm starting to sense a desire for it to become, at least in part, a collective art project. I've noticed some of the new ideas that excite me are moving me in this direction.

For example, I've been mulling over creating an experiment to try to explore the edges and ethical boundaries of AI and meditation. Imagine, purely as a provocative art piece, a "bad AI meditation teacher": an experiment (with all appropriate warnings of course) on how things can potentially go wrong.

At the same time, I've also had new ideas that are tipping the scale more towards a research project. One thing I'd like to explore for example is to make a battery of tests across the different chatbots (ChatGPT, Claude, Gemini, etc...) to see how appropriate their advice is in the context of mindfulness training. This is just an idea, but imagine finding some standardized criteria (perhaps from the most scientifically studied mindfulness practice, MBSR) and apply these criteria to chatbots suggestions... M... Too many ideas! 😅

## Looking forward

As we enter the third week of this journey, I'm excited to see where these different paths might lead us. Whether AIM Lab evolves more into an artistic exploration, a research endeavor, or something in between, I'm grateful for your engagement and support along the way.

I'd love for you to try out the new [Instant Meditation Reader](https://meditationlab.ai/reader) and share your experiences with it! What kind of meditations are you creating? How is the experience different from using the Studio? Your feedback will be super useful as I continue to develop and refine it.

And of course, I hope to see some of you joining the 7-day meditation challenge! It's a great opportunity to experience the new reader while refreshing your practice.

Looking forward to hearing about your experiences!
`;
