import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { listApplications } from "@/lib/db";
import { Empty, PageHeader } from "@/components/ui";
import { PipelineBoard } from "@/components/pipeline-board";

export const metadata: Metadata = { title: "Pipeline" };

export default async function PipelinePage() {
  const { t } = await getDict();
  const apps = listApplications();
  const items = apps.map((a) => ({
    id: a.id,
    status: a.status,
    updated_at: a.updated_at,
    next_action_at: a.next_action_at,
    title: a.job.title,
    company: a.job.company,
    score: a.evaluation?.global ?? null,
    job_id: a.job_id,
  }));
  return (
    <>
      <PageHeader title={t.pipeline.title} />
      {items.length === 0 ? (
        <Empty title={t.pipeline.empty}>
          <Link href="/app/jobs" className="btn btn-primary">{t.nav.jobs}</Link>
        </Empty>
      ) : (
        <PipelineBoard items={items} />
      )}
    </>
  );
}
