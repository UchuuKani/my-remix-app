import { useActionData, redirect, Form, useTransition } from "remix";
import type { ActionFunction, LoaderFunction } from "remix";
import invariant from "tiny-invariant";

export default function EditPost() {
  const errors = useActionData();
  const transition = useTransition();

  return <div>Uh ok</div>;
}
