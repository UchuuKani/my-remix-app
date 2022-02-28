import { Outlet, Link, useLoaderData } from "remix";
import adminStyles from "~/styles/admin.css";

export const links = () => {
  return [{ rel: "stylesheet", href: adminStyles }];
};

import { getPosts } from "~/post";
import type { Post } from "~/post";

export const loader = async () => {
  return getPosts();
};

export default function Admin() {
  const posts = useLoaderData<Post[]>();
  return (
    <div className="admin">
      <nav>
        <h1>Admin</h1>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                <Link to={`/admin/edit/${post.slug}`}>Edit</Link>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
