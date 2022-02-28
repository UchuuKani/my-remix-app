import {
  useActionData,
  redirect,
  Form,
  useTransition,
  useLoaderData,
} from "remix";
import type { ActionFunction, LoaderFunction } from "remix";
import invariant from "tiny-invariant";

import { getPost, editPost } from "~/post";

type PostError = {
  title?: boolean;
  slug?: boolean;
  markdown?: boolean;
  prevSlug?: true;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  const prevSlug = formData.get("prevSlug");

  const errors: PostError = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;
  if (!prevSlug) errors.prevSlug = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");
  invariant(typeof prevSlug === "string");

  await editPost({ title, slug, markdown, prevSlug });

  return redirect("/admin");
};

export default function EditSlugPost() {
  const post = useLoaderData();
  const errors = useActionData();
  const transition = useTransition();

  return (
    <Form method="post" key={post.slug}>
      <p>
        <label>
          Post Title: {errors?.title ? <em>Title is required</em> : null}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug ? <em>Slug is required</em> : null}
          <input type="text" name="slug" defaultValue={post.slug} />
          <input type="hidden" name="prevSlug" value={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{" "}
        {errors?.markdown ? <em>Markdown is required</em> : null}
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          defaultValue={post.html}
        />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? "Saving..." : "Save Edit"}
        </button>
      </p>
    </Form>
  );
}
