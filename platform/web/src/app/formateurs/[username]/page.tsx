import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, BookOpenCheck, Clock, GraduationCap, Layers } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { CourseCard } from "@/components/course-card";
import { Particles } from "@/components/fx/particles";
import { ScrambleText } from "@/components/fx/scramble-text";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { apiGet } from "@/lib/api";
import type { CourseSummary } from "@/lib/courses";

type Profile = { id: number; username: string; displayName: string; headline: string | null; bio: string | null; avatarUrl: string | null };

export async function generateMetadata({ params }: PageProps<"/formateurs/[username]">): Promise<Metadata> {
  const profile = await apiGet<Profile>(`/public/users/${encodeURIComponent((await params).username)}`);
  return profile
    ? { title: profile.displayName, description: profile.headline ?? `Les cours de ${profile.displayName}.` }
    : { title: "Formateur introuvable" };
}

export default async function InstructorPage({ params }: PageProps<"/formateurs/[username]">) {
  const { username } = await params;
  const [profile, catalog] = await Promise.all([
    apiGet<Profile>(`/public/users/${encodeURIComponent(username)}`),
    apiGet<CourseSummary[]>("/public/courses"),
  ]);
  if (!profile) notFound();
  const courses = (catalog ?? []).filter((course) => course.author.username === profile.username);
  const lessons = courses.reduce((sum, course) => sum + course.lessonCount, 0);
  const hours = Math.round(courses.reduce((sum, course) => sum + course.durationMinutes, 0) / 60);
  const topics = new Set(courses.flatMap((course) => course.tags.map((tag) => tag.slug))).size;

  return (
    <>
      <SmoothScroll />
      <section className="surface-navy noise relative overflow-hidden text-white">
        <Particles className="pointer-events-none absolute inset-0 size-full opacity-50" density={15000} maxPoints={60} />
        <div aria-hidden className="glow-arc animate-spin-slow -top-1/3 -right-1/4 aspect-square w-[60%] opacity-60" />
        <div className="container-page relative grid items-center gap-10 py-16 md:grid-cols-[auto_1fr]">
          <Reveal className="relative mx-auto md:mx-0">
            <span className="animate-pulse-ring block rounded-full bg-gradient-to-br from-[oklch(0.82_0.12_190)] to-[oklch(0.55_0.11_220)] p-1.5">
              <Avatar name={profile.displayName} src={profile.avatarUrl} className="size-40 text-4xl ring-4 ring-[oklch(0.2_0.045_250)] sm:size-48" />
            </span>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-[oklch(0.85_0.1_190)]">
              <BadgeCheck className="size-3.5" aria-hidden /> Formateur vérifié
            </span>
            <h1 className="heading-display text-4xl text-white sm:text-5xl">
              <ScrambleText text={profile.displayName} duration={1400} delay={150} />
            </h1>
            {profile.headline && <p className="text-lg font-semibold text-[oklch(0.85_0.1_190)]">{profile.headline}</p>}
            {profile.bio && <p className="max-w-2xl leading-7 text-white/75">{profile.bio}</p>}
          </Reveal>
        </div>
        <div className="container-page relative pb-12">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: GraduationCap, value: courses.length, label: "cours" },
              { icon: BookOpenCheck, value: lessons, label: "leçons" },
              { icon: Clock, value: hours, label: "heures de contenu", suffix: " h" },
              { icon: Layers, value: topics, label: "thèmes" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <stat.icon className="size-5 shrink-0 text-[oklch(0.82_0.12_190)]" aria-hidden />
                <div className="flex flex-col-reverse">
                  <dt className="text-xs text-white/60">{stat.label}</dt>
                  <dd className="text-2xl font-extrabold">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-14" aria-labelledby="ses-cours">
        <Reveal className="flex flex-col gap-2">
          <h2 id="ses-cours" className="heading-section">
            Les cours de <span className="text-accent-gradient">{profile.displayName}</span>
          </h2>
          <p className="text-muted-foreground">Tous gratuits, avec quiz de chapitre et certificat signé.</p>
        </Reveal>
        {courses.length > 0 ? (
          <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {courses.map((course) => (
              <StaggerItem key={course.slug} className="h-full">
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="mt-8 text-muted-foreground">Aucun cours publié pour l&apos;instant.</p>
        )}
      </section>
    </>
  );
}
