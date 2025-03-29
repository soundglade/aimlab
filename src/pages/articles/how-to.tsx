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
      title="How-to create guided meditations"
      date="March 27, 2025"
      content={
        <>
          <p>
            Hi there, This blog post will show you how to create meditations,
            combining AI chatbots with the custom tools offered by AIMlab.
          </p>

          <p>
            This is a practical article. For more info you can also read more
            about <strong>what is AIMlab and why I created it</strong>, and also
            check out some <strong>practical creative examples</strong>.
          </p>

          <p>Let's begin!</p>

          <h3>The basic method</h3>

          <p>
            It may be useful to start by explaining the basic method. It's very
            simple: use AI chatbots such as ChatGPT to creatively generate a
            bespoke meditation script, then simply copy the script in our free
            Meditatation Composer, et voila, you have a customised high-quality
            guided meditation that you can play, download or share as you like.
          </p>

          <p>
            Actually, most of these experiments require a third step: gather
            creative sources for inspiration. Chatbots have already baked in
            lots of knowledge about meditative traditions, but they may lack
            details, particularly about less known meditative style. So sourcing
            and providing them content (such as books, talks, or other
            meditation scripts for inspiration) is also going to be an important
            step.
          </p>

          <p>In a nutshell:</p>
          <ol>
            <li>Gather inspiration material (optional)</li>
            <li>Generate and refine with chatbot</li>
            <li>
              Synthesize with <Link href="/composer">Meditation Composer</Link>
            </li>
          </ol>

          <p>
            I'll guide you first through the simplest example of generating a
            guided meditation, then expand on that offering more creative uses.
          </p>

          <h3>Generating a script with ChatGPT</h3>

          <p>
            The simplest use case is to just start with ChatGPT (or any other AI
            chatbot). Chatbots are very clever at generating text. So you can
            simply ask them to create a meditation script for you, including the
            length, the topic, and the methodologies.
          </p>

          <p>
            Feel to explore all variations. You can be very creative. But for
            simplicity, you can start with a prompt such as:
          </p>

          <blockquote>
            Generate a short meditation script for a guided meditation.
          </blockquote>

          <p>
            It's really as simple as that! Here is an example of an answer you
            can get from the chatbot:
          </p>

          <MarkdownChatSample content={answerSample} />

          <h3>Pauses</h3>

          <p>
            You can keep refining the script with the chatbot as much as you
            like. An important aspect to consider is to make sure the script has
            appropriate <strong>pauses markers</strong>. If there are none, you
            can ask it to add them.
          </p>

          <blockquote>
            Add pause markers in the format [pause for xx seconds]
          </blockquote>

          <p>
            The meditation composer supports pause markers. You don't have to
            worry too much about the format (how you spell it) because it's
            smart enough to understand, no matter how you write them.
          </p>

          <p>
            For now the Meditation Composer only supports precise length for
            pauses. So if you script says something like "allow a 1-2 minutes
            pause" the composer will decide a precise length for you. In the
            future I'm considering improving this to allow flexibile pauses, so
            that the Meditation Player could allow you to customize the length
            further at the moment of play.
          </p>

          <h3>The Meditation Composer</h3>

          <p>
            Wonderful! Now, the only thing left to do is to copy that script,
            open up the Meditation Composer, paste it, chose a voice, and let it
            do it's job.
          </p>

          <p>Some more info about the composer.</p>

          <ol>
            <li>
              Right now there are only two <strong>voices</strong> available,
              but it's likely I'm going to expand that further, perhaps even
              allowing you to pick any voice you like from voice libraries (such
              as from ElevenLabs)
            </li>

            <li>
              We are using AI to process you script and create a structured
              version, with precise text, pauses and headings. Sometimes the AI
              gets it wrong! <strong>Review</strong> it's interpretation before
              launching the final step. The only way to edit a draft is to go
              back and change the script source you are providing. Experiment
              with editing the original script and see what happens. We
              definetely need better editing features, and I'm hoping to
              introduce them soon.
            </li>

            <li>
              Unless you complete the whole flow nothing will be saved, and if
              you close the dialog you'll lose the script and have to start from
              scratch. Once you complete synthesizing a meditation thought the
              meditation is saved and always available.
            </li>
          </ol>

          <p>
            <em>
              Important: all meditations are public! Don't send any private
              information in your meditations!
            </em>
          </p>

          <h2>The Meditation Player</h2>

          <p>
            Once you have finished creating a meditation you can now play it.
            The Meditation Player is fascinating in itself, and contains
            something innovative: although it looks like a normal media player,
            it also shows the meditation script used, and you can jump at any
            given time in the meditation by tapping on a specific part of the
            script.
          </p>

          <p>
            You can also download the meditation, share it, or (if you are the
            creator) delete it.
          </p>

          <p>
            Remember that all meditations are public and shared with others! You
            can delete it if the experiment didn't work out as expected or for
            any reason it's not in a shareable state.
          </p>

          <p>
            Ok! We just created our first meditation! Here is how the meditation
            looks like in the Meditation Player.
          </p>

          <div className="flex justify-center">
            <Button asChild variant="default" className="mb-10 mt-10">
              <Link
                href="https://aimlab.soundglade.com/m/jftmpv6"
                className="no-underline"
              >
                Play Meditation
              </Link>
            </Button>
          </div>

          <h2>Adding sources of inspirations</h2>

          <p>
            Now that I showed you the simplest use case I'm going to show you
            how to go a step further, ad unlock new possibilities by guiding
            your chatbot with sources of inspirations.
          </p>

          <p>The possibilities are endless:</p>

          <ul>
            <li>
              you can generate a meditation starting from another meditation
              script and "remix" it
            </li>
            <li>
              you can use a talk from YouTube or a podcast as a source of
              inspiration
            </li>
            <li>
              you can even take pictures of your view right now (or a picture of
              artwork) and generate guided open-eye contemplations
            </li>
            <li>
              you can provide entire books to the chatbot and generate
              meditations that follow that particular style
            </li>
          </ul>

          <p>
            These are just some examples, and I'm sure you'll come up with new,
            even more interesting methods.
          </p>

          <p>Let's see how to achieve some of this in practice</p>

          <h2>How to "remix" a meditation you like</h2>

          <p>
            It's possible and quite easy to create new guided meditations based
            on other meditations.
          </p>

          <p>
            The tricky bit may be to find a way to obtain a text-version of the
            meditation you want to remix.
          </p>

          <p>
            I'm considering building a specific tool that allows you to simply
            play the meditation, and it'd create a transcript for you. If you
            find this idea interesting do let me know.
          </p>

          <p>For now thought, we have to find alternative methods.</p>

          <p>
            If the meditation is in a YouTube video you can easily copy the
            transcript from there.
          </p>

          <p>
            If you are not sure how to do this, ask your favourite ChatBot. I
            personally use this Chrome Extension to simplify the process.
            https://chromewebstore.google.com/detail/transcript-youtube/obigemjopcmecfaacinededdfdcinikk
          </p>

          <p>
            Once you have the script, you can start a new chat in your chatbot,
            attach the script, and ask it to generate the meditation you like.
          </p>

          <p>For example</p>

          <blockquote>
            I attach the transcript of a meditation I like. Can you re-write
            this as meditation script? Make sure you also add pause marks in a
            format such as [pause for xx seconds].
          </blockquote>

          <p>
            The chatbot will create for you replica of the original meditation
            as a script.
          </p>

          <p>
            Now you can start to customize it ("remix it") as you like.
            <br />
            Some interesting examples:
          </p>

          <blockquote>
            Can you rewrite it by doubling it's length? Expand both the guidance
            and the length of pauses.
          </blockquote>

          <blockquote>
            Can you rewrite it in first person, as if it's read as a form of
            self affirmation?
          </blockquote>

          <blockquote>
            Can you rewrite it by removing the introduction and extending the
            central part?
          </blockquote>

          <p>Sky's the limit!</p>

          <h1>
            How to generate meditations based on talks, books, or pictures
          </h1>

          <p>
            You can expand the method I showed you with all sorts of sources:
          </p>

          <ul>
            <li>
              you can copy the transcript of particular talk from YouTube and
              ask a chatbot to create a meditation that capture the essence of
              what's bien said (extra tip: ask it to stay as close as possible
              to the original words used in the talk)
            </li>
            <li>
              you can provide it an entire book (if you can find it's source in
              a pdf or other downloadable formats) and ask it to generate
              meditations based on those teachings and methods
            </li>
            <li>
              you can even just snap a photo and ask it to generate an open-eyed
              meditation based on that photo (snap-to-meditation!)
            </li>
          </ul>

          <p>
            If you are curious, I wrote another post full of these examples.
          </p>

          <p>
            I briefly touched upon this, but if you have any questions feel free
            to ask.
          </p>

          <p>You can always use the Feedback form to leave me a message.</p>

          <h1>Final recap</h1>

          <p>
            And that's all for now! I hope these simple instructions are enough
            to give you a start. As you may have noticed, it's all still quite
            experimental. If you like to get dirty and play with these different
            tools and method I'm sure you'll discover something interesting.
          </p>

          <p>
            Feel free to share any interesting bits you found with the
            community.
          </p>

          <p>
            So, to recap, the foundamental method to create customised guided
            meditations is:
          </p>

          <ol>
            <li>gather source of inspirations</li>
            <li>
              use a chatbot to create and refine a script (don't forget to add
              pauses!)
            </li>
            <li>
              use the Meditation Composer flow to synthesize a playable version
            </li>
          </ol>

          <p>Enjoy!</p>
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
