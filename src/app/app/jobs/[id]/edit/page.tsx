import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { getJob } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { JobForm } from "@/components/job-form";
import { editJob } from "@/app/actions/jobs";

export default async function EditJobPage({ params }: PageProps<"/app/jobs/[id]/edit">) {
  const { id } = await params;
  const job = getJob(Number(id));
  if (!job) notFound();
  const { t } = await getDict();
  const action = editJob.bind(null, job.id);
  return (
    <>
      <PageHeader title={`${t.common.edit} — ${job.title}`} />
      <JobForm
        initial={{ ...job, url: job.url.startsWith("manual://") ? "" : job.url, deadline: job.deadline ?? "" }}
        action={async (_p, fd) => {
          "use server";
          return action(fd);
        }}
        submitLabel={t.common.save}
      />
    </>
  );
}
