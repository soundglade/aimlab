import { PostLayout } from "@/components/blog/PostLayout";

export default function HowToBlogPost() {
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
            <li>Gather inspiration</li>
            <li>Generate and refine with chatbot</li>
            <li>Synthesize with Meditation Composer</li>
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
            Generate a meditation script for a 10mn guided meditation.
          </blockquote>

          <p>It's really as simple as that!</p>

          <blockquote>[example here - summary that is togglable]</blockquote>

          <h3>Pauses</h3>

          <p>
            Except, there is an extra important step I recommend: ask it to
            refine the script further by adding proper{" "}
            <strong>pauses markers</strong>.
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

          <p>Here is the script refined</p>

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
            Ok, so we just created our first meditation! Here is how the daily
            meditation looks like in the Meditation Player.
          </p>

          <blockquote>link here</blockquote>

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
