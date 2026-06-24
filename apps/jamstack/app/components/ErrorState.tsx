/**
 * Accessible error panel shown when the GitHub API request fails. Uses
 * `role="alert"` so assistive tech announces it, and offers a retry link back to
 * the page the user asked for. A 403 is almost always GitHub's unauthenticated
 * rate limit, so we say so plainly.
 */
export function ErrorState({ retryHref, status }: { retryHref: string; status?: number }) {
  const isRateLimited = status === 403;
  return (
    <div role="alert" className="rounded-md bg-red-50 p-4 text-red-800">
      <h2 className="text-sm font-semibold">Couldn’t load repositories</h2>
      <p className="mt-1 text-sm">
        {isRateLimited
          ? "GitHub’s API rate limit was reached. Please wait a moment and try again."
          : "Something went wrong while contacting the GitHub API. Please try again."}
      </p>
      <p className="mt-3">
        <a
          href={retryHref}
          className="text-sm font-semibold text-red-900 underline hover:no-underline"
        >
          Try again
        </a>
      </p>
    </div>
  );
}
