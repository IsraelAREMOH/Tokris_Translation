import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { LoadErrorBanner } from "@/components/portal/load-error-banner";
import { StatusBadge } from "@/components/status-badge";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getSiteContent } from "@/lib/content/site-content";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

type ProjectRow = {
  id: string;
  source_language: string;
  target_language: string;
  status: string;
  deadline: string | null;
  created_at: string;
};

type MessageRow = {
  id: string;
  sender_id: string | null;
  message_text: string;
  created_at: string;
  projects: {
    id: string;
    source_language: string;
    target_language: string;
  } | null;
};

// Adapted from the public "How It Works" journey for the signed-in context.
const ONBOARDING_STEPS = [
  {
    title: "Submit your documents",
    description:
      "Upload your files with a quote request, legal, immigration, academic, medical, financial or business documents.",
  },
  {
    title: "Receive a free quote",
    description:
      "Our specialists review your project and reply with a transparent quotation, right here in your portal.",
  },
  {
    title: "Translation & quality assurance",
    description:
      "Your project is translated, edited, proofread and verified by experienced linguists.",
  },
  {
    title: "Secure delivery",
    description:
      "Download your completed documents from this portal securely and on time.",
  },
];

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold tracking-[-0.02em] text-foreground">
        {value}
      </p>
    </div>
  );
}

export default async function PortalDashboardPage() {
  const { supabase, user } = await requireUser();

  const [
    { data: profileData },
    { data: projectsData, error: projectsError },
    { data: messagesData, error: messagesError },
    { count: deliveredFileCount, error: filesError },
    siteContent,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    // RLS limits every query below to the signed-in client's own records.
    supabase
      .from("projects")
      .select(
        "id, source_language, target_language, status, deadline, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select(
        "id, sender_id, message_text, created_at, projects(id, source_language, target_language)",
      )
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("project_files")
      .select("id", { count: "exact", head: true })
      .eq("file_type", "completed"),
    getSiteContent(),
  ]);

  if (projectsError) console.error("Portal dashboard: projects load failed:", projectsError.message);
  if (messagesError) console.error("Portal dashboard: messages load failed:", messagesError.message);
  if (filesError) console.error("Portal dashboard: file count load failed:", filesError.message);

  // A failed query defaults to [] below, which looks identical to "you
  // genuinely have none" — this flag lets the render branch tell those
  // apart instead of showing new-client onboarding to an existing client
  // whose data just failed to load.
  const hasLoadError = Boolean(projectsError || messagesError || filesError);

  const projects = (projectsData ?? []) as ProjectRow[];
  const messages = (messagesData ?? []) as unknown as MessageRow[];
  const recentProjects = projects.slice(0, 4);

  const firstName = profileData?.full_name?.trim().split(/\s+/)[0];

  const tiles = [
    {
      label: "Active requests",
      value: projects.filter((project) => project.status !== "Delivered")
        .length,
    },
    {
      label: "In translation",
      value: projects.filter(
        (project) =>
          project.status === "Translating" ||
          project.status === "Quality Check",
      ).length,
    },
    { label: "Documents delivered", value: deliveredFileCount ?? 0 },
  ];

  const whatsappNumber =
    siteContent.whatsapp_number ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "";
  const contactEmail =
    siteContent.contact_email || "info@tokrisglobal.com";
  const contactPhone = siteContent.contact_phone || "+234 912 188 4999";

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            {firstName ? `Welcome, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Track your translation requests, message the TGS team and download
            completed documents all in one place.
          </p>
        </div>
        <Link
          href="/quote"
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          Request a quote
        </Link>
      </div>

      {hasLoadError ? (
        <LoadErrorBanner message="Some of your dashboard data couldn't load right now — please refresh the page." />
      ) : null}

      {projects.length === 0 && !hasLoadError ? (
        <section className="rounded-xl border border-border bg-surface p-6 shadow-elevated sm:p-8">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
            Getting started
          </p>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
            Your first translation, in four steps
          </h2>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            From certified and sworn translation to localization and
            transcription, every TGS project follows the same simple journey.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-border bg-background p-4"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-600/10 text-sm font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-[1.7] text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <Link
            href="/quote"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            Get your free quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {tiles.map((tile) => (
              <StatTile key={tile.label} label={tile.label} value={tile.value} />
            ))}
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
                  Recent requests
                </h2>
                <Link
                  href="/portal/requests"
                  className="rounded-sm text-xs font-semibold text-brand-700 transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 dark:text-brand-300"
                >
                  View all
                </Link>
              </div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {recentProjects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/portal/requests/${project.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {project.source_language} → {project.target_language}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Submitted {formatDate(project.created_at)} · Deadline{" "}
                          {formatDate(project.deadline)}
                        </p>
                      </div>
                      <StatusBadge status={project.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
              <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
                Latest messages
              </h2>
              {messages.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No messages yet, open a request to start a conversation with
                  the TGS team.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {messages.map((message) => (
                    <li key={message.id}>
                      <Link
                        href={
                          message.projects
                            ? `/portal/requests/${message.projects.id}`
                            : "/portal/requests"
                        }
                        className="flex flex-col gap-1 rounded-lg border border-border bg-background px-3.5 py-2.5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
                      >
                        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                          <span className="text-xs font-semibold text-foreground">
                            {message.sender_id === user.id ? "You" : "TGS Team"}
                            {message.projects ? (
                              <span className="ml-2 font-normal text-muted-foreground">
                                {message.projects.source_language} →{" "}
                                {message.projects.target_language}
                              </span>
                            ) : null}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDateTime(message.created_at)}
                          </span>
                        </span>
                        <span className="line-clamp-2 text-sm text-muted-foreground">
                          {message.message_text}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated sm:p-6">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
          Need help with a project?
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-[1.7] text-muted-foreground">
          Certified translation, sworn translation, interpretation,
          localization, transcription or language training, our team is one
          message away, with strict confidentiality on every project.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366] px-4 py-2 text-xs font-semibold text-white shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25d366] active:translate-y-0 active:scale-[0.98]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat on WhatsApp
            </a>
          ) : null}
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            <Mail className="h-3.5 w-3.5" />
            {contactEmail}
          </a>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {contactPhone}
          </span>
        </div>
      </section>
    </div>
  );
}
