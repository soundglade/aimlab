import { PostLayout } from "@/components/blog/PostLayout";

export default function FirstExperimentsBlogPost() {
  return (
    <PostLayout
      title="Creative examples"
      date="March 28, 2025"
      content={
        <>
          <p>
            Hi there, In this blog post I'm going to list some experiments I've
            recently tested. The idea is to inspire you to try your own
            experiments and share some questions and reflections along the way.
          </p>

          <p>
            (For a more practical look at how to create your own meditatations
            you can check out this post intead. Also, I wrote another more
            generic post about what is AIMLab and why I createdit)
          </p>

          <p>
            There is a wide range of possibilities. Each one of these experients
            is really opening up a whole category of explorations. I'm going to
            explore creating a 10 minutes daily meditation, remix existing
            meditations you like, write precise ones based on books or talks,
            write a whole series of meditations with an arch and intention, and
            some extra creative ways to generate meditations based on photos or
            to contemplate artwork.
          </p>

          <h3>Daily guided meditations in your favourite style</h3>

          <p>
            The easiest and simplest way is to start straight from a chatbot.
          </p>

          <blockquote>
            Generate a meditation script for a 10mn daily guided meditation in
            the style of Sam Harris's Waking Up app. Add pause markers in the
            format [pause for xx seconds]
          </blockquote>

          <p>
            It's really as simple as that! Here is the script I've got and the
            final playable meditation.
          </p>

          <blockquote>[example here - summary that is togglable]</blockquote>

          <h3>Remixing meditations</h3>
        </>
      }
    />
  );
}
