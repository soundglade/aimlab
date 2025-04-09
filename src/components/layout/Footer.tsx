import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-0 w-full px-3 py-6 md:mt-6">
      <div className="mx-auto flex max-w-3xl flex-row items-center justify-around px-4">
        <div className="flex w-1/3 flex-col items-start">
          <Link href="/" className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium">AIM Lab</span>
          </Link>
          <p className="text-muted-foreground text-xs">
            <span className="hidden md:inline">The AI Meditation</span>{" "}
            Playground
          </p>
        </div>

        <div className="w-1/3 text-center">
          <p className="text-muted-foreground mb-1 text-xs">Sponsored By</p>
          <a className="text-sm hover:underline" href="https://soundglade.com">
            SoundGlade
          </a>
        </div>

        <div className="w-1/3 text-right">
          <ul>
            <li>
              <Link
                href="https://www.reddit.com/r/AIMeditationLab/"
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <RedditIcon className="mr-2 inline-block h-4 w-4" />
                <span className="hidden md:inline">r/AIMeditationLab</span>
                <span className="md:hidden">Reddit</span>
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/soundglade/aimlab"
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <Github className="mr-2 inline-block h-4 w-4" />
                GitHub <span className="hidden md:inline">Repository</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-5xl justify-between px-4 pt-4">
        <p className="text-muted-foreground text-xs"></p>
      </div>
    </footer>
  );
}

const BlueSkyIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 360 320" fill="currentColor" className={className}>
    <path d="M180 142c-16.3-31.7-60.7-90.8-102-120C38.5-5.9 23.4-1 13.5 3.4 2.1 8.6 0 26.2 0 36.5c0 10.4 5.7 84.8 9.4 97.2 12.2 41 55.7 55 95.7 50.5-58.7 8.6-110.8 30-42.4 106.1 75.1 77.9 103-16.7 117.3-64.6 14.3 48 30.8 139 116 64.6 64-64.6 17.6-97.5-41.1-106.1 40 4.4 83.5-9.5 95.7-50.5 3.7-12.4 9.4-86.8 9.4-97.2 0-10.3-2-27.9-13.5-33C336.5-1 321.5-6 282 22c-41.3 29.2-85.7 88.3-102 120Z"></path>
  </svg>
);

const RedditIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 429.709 429.709" fill="currentColor" className={className}>
    <g>
      <path
        fill="currentColor"
        d="M429.709,196.618c0-29.803-24.16-53.962-53.963-53.962c-14.926,0-28.41,6.085-38.176,15.881
      c-30.177-19.463-68.73-31.866-111.072-33.801c0.026-17.978,8.078-34.737,22.104-45.989c14.051-11.271,32.198-15.492,49.775-11.588
      l2.414,0.536c-0.024,0.605-0.091,1.198-0.091,1.809c0,24.878,20.168,45.046,45.046,45.046s45.046-20.168,45.046-45.046
      c0-24.879-20.168-45.046-45.046-45.046c-15.997,0-30.01,8.362-38.002,20.929l-4.317-0.959c-24.51-5.446-49.807,0.442-69.395,16.156
      c-19.564,15.695-30.792,39.074-30.818,64.152c-42.332,1.934-80.878,14.331-111.052,33.785c-9.767-9.798-23.271-15.866-38.2-15.866
      C24.16,142.656,0,166.815,0,196.618c0,20.765,11.75,38.755,28.946,47.776c-1.306,6.68-1.993,13.51-1.993,20.462
      c0,77.538,84.126,140.395,187.901,140.395s187.901-62.857,187.901-140.395c0-6.948-0.687-13.775-1.991-20.452
      C417.961,235.381,429.709,217.385,429.709,196.618z M345.746,47.743c12,0,21.762,9.762,21.762,21.762
      c0,11.999-9.762,21.761-21.762,21.761s-21.762-9.762-21.762-21.761C323.984,57.505,333.747,47.743,345.746,47.743z M23.284,196.618
      c0-16.916,13.762-30.678,30.678-30.678c7.245,0,13.895,2.538,19.142,6.758c-16.412,14.08-29.118,30.631-37.007,48.804
      C28.349,215.937,23.284,206.868,23.284,196.618z M333.784,345.477c-31.492,23.53-73.729,36.489-118.929,36.489
      s-87.437-12.959-118.929-36.489c-29.462-22.013-45.688-50.645-45.688-80.621c0-29.977,16.226-58.609,45.688-80.622
      c31.492-23.53,73.729-36.489,118.929-36.489s87.437,12.959,118.929,36.489c29.462,22.013,45.688,50.645,45.688,80.622
      C379.471,294.832,363.246,323.464,333.784,345.477z M393.605,221.488c-7.891-18.17-20.596-34.716-37.005-48.794
      c5.247-4.22,11.901-6.754,19.147-6.754c16.916,0,30.678,13.762,30.678,30.678C406.424,206.867,401.353,215.925,393.605,221.488z"
      />
      <circle fill="currentColor" cx="146.224" cy="232.074" r="24.57" />
      <circle fill="currentColor" cx="283.484" cy="232.074" r="24.57" />
      <path
        fill="currentColor"
        d="M273.079,291.773c-17.32,15.78-39.773,24.47-63.224,24.47c-26.332,0-50.729-10.612-68.696-29.881
      c-4.384-4.704-11.751-4.96-16.454-0.575c-4.703,4.384-4.96,11.752-0.575,16.454c22.095,23.695,53.341,37.285,85.726,37.285
      c29.266,0,57.288-10.847,78.905-30.543c4.752-4.33,5.096-11.694,0.765-16.446C285.197,287.788,277.838,287.44,273.079,291.773z"
      />
    </g>
  </svg>
);
