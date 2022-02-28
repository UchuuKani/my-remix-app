import path from "path";
import fs from "fs/promises";
import parseFrontMatter from "front-matter";
import invariant from "tiny-invariant";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  html: string;
};

type NewPost = {
  title: string;
  slug: string;
  markdown: string;
};

export type PostMarkdownAttributes = {
  title: string;
};

function isValidPostAttributes(
  attributes: any
): attributes is PostMarkdownAttributes {
  return attributes?.title;
}

const postsPath = path.join(__dirname, "..", "posts");

// get all posts
export async function getPosts() {
  const dir = await fs.readdir(postsPath);
  return Promise.all(
    dir.map(async (filename) => {
      const file = await fs.readFile(path.join(postsPath, filename));
      const { attributes } = parseFrontMatter(file.toString());

      invariant(
        isValidPostAttributes(attributes),
        `${filename} has bad meta data!`
      );

      return {
        slug: filename.replace(/\.md$/, ""),
        title: attributes.title,
      };
    })
  );
}

// get a single post based on its $slug
export async function getPost(slug: string) {
  const filepath = path.join(postsPath, slug + ".md");
  const file = await fs.readFile(filepath);
  const { attributes, body } = parseFrontMatter(file.toString());

  invariant(
    isValidPostAttributes(attributes),
    `Post ${filepath} is missing attributes`
  );

  const html = marked(body);
  return { slug, html, title: attributes.title };
}

export async function createPost(post: NewPost) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.writeFile(path.join(postsPath, post.slug + ".md"), md);
  return getPost(post.slug);
}

export async function deletePost(slug: string) {
  await fs.unlink(path.join(postsPath, slug + ".md"));
  // after deleting post, return new list of posts?
  return getPosts();
}

interface PostEdit extends NewPost {
  prevSlug?: string;
}

export async function editPost(post: PostEdit) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.writeFile(path.join(postsPath, post.slug + ".md"), md);

  invariant(post.prevSlug, "Old slug does not exist");

  await deletePost(post.prevSlug);
  return getPost(post.slug);
}
