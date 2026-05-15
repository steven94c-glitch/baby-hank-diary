import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const babyName = process.env.BABY_NAME ?? "Baby Hank";

async function submit(formData: FormData) {
  "use server";
  const entered = String(formData.get("password") ?? "");
  const expected = process.env.SITE_PASSWORD ?? "";
  if (expected && entered === expected) {
    const jar = await cookies();
    jar.set("diary_auth", expected, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    redirect("/");
  }
  redirect("/login?error=1");
}

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-block uppercase text-4xl" style={{ color: "var(--ink)" }}>
        {babyName}
      </h1>
      <p className="mt-2 font-hand text-lg" style={{ color: "var(--cornstalk-deep)" }}>
        family password, please
      </p>
      <form action={submit} className="mt-8 space-y-3">
        <input
          name="password"
          type="password"
          autoFocus
          className="w-full rounded px-3 py-2 outline-none"
          style={{ background: "var(--paper)", border: "1px solid var(--cornstalk)" }}
        />
        <button
          type="submit"
          className="w-full rounded px-3 py-2 font-hand text-lg"
          style={{ background: "var(--cornstalk)", color: "var(--ink)" }}
        >
          Enter
        </button>
        {error && <p className="font-hand text-base text-red-700">Incorrect password.</p>}
      </form>
    </main>
  );
}
