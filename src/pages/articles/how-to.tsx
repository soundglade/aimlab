import { PostLayout } from "@/components/blog/PostLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import Markdown from "react-markdown";
import Link from "next/link";

function MarkdownChatSample({ content }: { content: string }) {
  return (
    <ScrollArea className="bg-muted border-1 h-[500px] rounded-md px-4 py-4 md:h-[600px] md:px-12 md:py-12">
      <Markdown>{content}</Markdown>
    </ScrollArea>
  );
}

export default function BlogPost() {
  return (
    <PostLayout
      title="How to Create Guided Meditations Using AIM Lab"
      date="March 27, 2025"
      content={
        <>
          <p>
            Hi there! In this blog post, I'll guide you through how to create
            personalized guided meditations by combining AI chatbots with some
            custom tools offered by AIM Lab. This article is practical and
            hands-on, but if you'd like some background first, you might enjoy
            reading my other posts: *"What is AIM Lab and Why Was It Created?"*
            and *"Creative Examples of Guided Meditations."* Now, let’s dive
            straight in!
          </p>

          <h2>The Basic Method</h2>

          <p>
            It’s useful to start by briefly explaining the basic method. It’s
            actually really simple. First, you'll use an AI chatbot, such as
            ChatGPT, to creatively generate a unique meditation script. Then,
            you just copy that script into AIM Lab’s meditation composer, et
            voilà! You'll instantly have your very own, customized guided
            meditation ready to play, download, or share however you like.
          </p>

          <p>
            In practice, though, there’s often a third, optional step: gathering
            creative inspiration. While chatbots have impressive knowledge about
            meditation, they sometimes lack specific details, especially when it
            comes to less common meditation styles. So, it can help a lot to
            provide the chatbot with additional material for inspiration—like
            books, talks, or existing meditation scripts.
          </p>

          <p>
            To quickly recap, the basic method involves gathering inspiration
            (optional), generating and refining your script with a chatbot, and
            then synthesizing it with the meditation composer.
          </p>

          <h2>Generating a Script with ChatGPT</h2>

          <p>
            Let's go through a very simple example. First, open ChatGPT and
            start with a straightforward prompt like: "Generate a short script
            for a guided meditation." It really can be that easy! (I’ll include
            an example of a typical response at the end of this post.)
          </p>

          <p>
            However, a quick heads-up: sometimes ChatGPT suggests it can also
            generate sounds or music for your meditation. Unfortunately, that’s
            a hallucination—ChatGPT can’t do this (yet!), and that's exactly why
            we built a separate tool: the meditation composer.
          </p>

          <h2>Adding Pauses to Your Meditation Script</h2>

          <p>
            You can keep refining your script with the chatbot as much as you
            like, but one important detail to check is whether your meditation
            script has pause markers. If there are none, you can simply ask
            ChatGPT something like, "Please add pause markers in the format:
            `[pause for XX seconds]`."{" "}
          </p>

          <p>
            The meditation composer is pretty clever, so don't stress too much
            about exact formatting—it usually figures it out just fine. However,
            right now it supports precise pauses only. If your script says
            something vague like "Pause for one or two minutes," the composer
            will pick a specific length for you. I’m considering making pauses
            more flexible in the future, but for now, it picks a fixed duration.
          </p>

          <h2>Using the Meditation Composer</h2>

          <p>
            With your script ready, copy and paste it into the meditation
            composer. You'll see an area where you can paste the text and choose
            a voice. Currently, there are only two voices available, but I'm
            planning to expand this soon—perhaps even letting you pick voices
            from services like Eleven Labs.
          </p>

          <p>
            The meditation composer uses AI to process your script, adding
            structure to ensure pauses, text, and headings are correctly
            interpreted by the synthesizer. However, sometimes it makes
            mistakes. That's why the second step is important: reviewing the
            interpreted version. Check that the text, pauses, and headings look
            right. If something needs changing, right now, the only way to edit
            it is by going back to your original script, editing it there, and
            resubmitting it. I know this isn't ideal, and I'm considering more
            flexible editing options in the future.
          </p>

          <p>
            If everything looks good, you can move forward to synthesize your
            meditation. This might take from one to a few minutes, depending on
            the meditation length and server load. Be patient, wait for it to
            finish, and once done, you’ll have a fully synthesized meditation.
          </p>

          <h2>The Meditation Player</h2>

          <p>
            When the synthesis finishes, you’ll be offered the chance to play
            your meditation right away. The meditation player is quite
            interesting because, unlike most players in meditation apps, it
            shows your meditation script clearly—including headings and pauses.
            You can even tap or click on different parts of the script to jump
            ahead, skip parts you don't like, or revisit sections easily.
          </p>

          <p>
            Of course, the player includes the usual features like play, pause,
            forward, backward, and a progress bar to jump around freely. You can
            also download your meditation as an MP3 file directly from here.
          </p>

          <p>
            Sharing your meditation is also straightforward—just click the share
            button to copy the URL, which you can then send to anyone. But
            here's an important caution: **all meditations created with AIM Lab
            are public.** Please don't include any private or sensitive
            information in your meditations. If something doesn't look right or
            you simply don't want a meditation online anymore, you can easily
            delete it right from the meditation player.
          </p>

          <p>
            You can also view all the meditations you've created in one
            place—the meditation composer's landing page—where you can easily
            open or delete them.
          </p>

          <h2>Known Issues and Glitches</h2>

          <p>
            It’s important to remember that AIM Lab is still experimental, and
            glitches are part of the journey. Here are some common issues:
          </p>

          <p>
            First, the length of generated meditations isn't always precise. If
            you ask for a 10-minute meditation, it might actually be anywhere
            from 6 to 12 minutes. I’m working on improving accuracy, possibly
            allowing fine-tuning after generation, but right now, keep
            expectations flexible.
          </p>

          <p>
            Second, sometimes pauses might be too short, too long, or simply
            awkward—like being instructed to inhale and then wait 15 seconds,
            which isn’t practical. Sometimes instructions for breathing
            exercises move forward without allowing enough time to actually do
            the exercise. Watch out for these small glitches.
          </p>

          <p>
            Lastly, remember chatbots occasionally hallucinate or confidently
            give incorrect guidance. While this can sometimes be funny, it could
            also be confusing or misleading. Always carefully review your script
            for accuracy and sanity before synthesizing.
          </p>

          <h2>Using Sources of Inspiration</h2>

          <p>
            One last tip: meditations become richer and more interesting if you
            provide your chatbot with additional sources of inspiration. These
            could include PDFs of books, meditation scripts, transcripts of
            talks, or even pictures. Chatbots like ChatGPT now allow you to
            upload these materials directly. Then, you can discuss with the
            chatbot how to creatively integrate that content into your
            meditation.
          </p>

          <p>
            For more detailed examples and ideas on using inspiration sources,
            you might want to check out my dedicated article on that topic.
          </p>

          <h2>Final Recap</h2>

          <p>
            So, to quickly recap: creating a guided meditation using AIM Lab
            involves gathering inspiration (optional), generating and refining
            scripts with a chatbot, and then synthesizing them with the
            meditation composer.
          </p>

          <p>
            That’s all for now! I hope you find this process enjoyable and
            insightful. AIM Lab is a community-driven project, so please share
            your feedback—it's always welcome.
          </p>

          <p>Enjoy your creative exploration!</p>
          <MarkdownChatSample content={answerSample} />
        </>
      }
    />
  );
}

const answerSample = `Absolutely — here's a short and calming meditation script you can use for a 5–7 minute guided meditation. It's centered on breath awareness and present-moment grounding.

---

**Title: "Coming Home to the Breath"**

Welcome.  
Find a comfortable position — sitting or lying down — and gently allow your eyes to close, or soften your gaze.

Begin by taking a deep breath in through the nose…  
and slowly out through the mouth.  
[pause]

One more time — breathe in deeply…  
and exhale fully, letting go.  
[pause]

Now, let your breath return to a natural rhythm.  
No need to change it. Just observe it.  
Feel the gentle rise and fall of your chest…  
the subtle movement of air in and out of your nostrils.  
[pause]

With each inhale, feel your body receive.  
With each exhale, feel it release.  
Let go of any tension. Let go of any effort.  
[pause]

If thoughts arise — that's okay. That's natural.  
Acknowledge them, then gently guide your attention back to the breath.  
Back to this moment.

Notice where you feel the breath the most —  
Maybe in your belly, your chest, or the tip of your nose.  
Rest your awareness there.  
[pause]

With each breath, allow yourself to soften a little more.  
Imagine the breath as a gentle wave, arriving… departing…  
bringing you home to yourself.  
[pause for 30–60 seconds]

And now, gently bring your awareness back to your body.  
Wiggle your fingers and toes…  
Notice the support beneath you.  
Take one more deep, nourishing breath in…  
and slowly exhale.  
[pause]

When you're ready, open your eyes.

Welcome back.

---

Let me know if you'd like it themed differently — like nature-based, body scan, loving-kindness, or something more playful or poetic.
`;
