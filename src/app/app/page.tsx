import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui";

export default async function Dashboard() {
  const { t } = await getDict();
  return <PageHeader title={t.dashboard.title} />;
}
