import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui";
import { JobForm } from "@/components/job-form";
import { createJob } from "@/app/actions/jobs";

export const metadata: Metadata = { title: "Add offer" };

export default async function NewJobPage() {
  const { t } = await getDict();
  return (
    <>
      <PageHeader title={t.jobs.importTitle} />
      <JobForm action={createJob} submitLabel={t.jobs.create} />
    </>
  );
}
