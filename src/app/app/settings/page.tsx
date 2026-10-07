import type { Metadata } from "next";
import { getDict, getTheme } from "@/lib/i18n/server";
import { getProfile } from "@/lib/db";
import { saveSettings } from "@/app/actions/profile";
import { SaveButton } from "@/components/save-button";
import { PageHeader } from "@/components/ui";
import { LangToggle, ThemeToggle } from "@/components/prefs-toggles";
import { DataTools, OllamaCheck } from "@/components/settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [{ t }, theme] = await Promise.all([getDict(), getTheme()]);
  const { settings } = getProfile();
  return (
    <>
      <PageHeader title={t.settings.title} />
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <form action={saveSettings} className="card p-5 space-y-4 rise" style={{ ["--i" as string]: 1 }}>
          <h2 className="text-xl">{t.settings.ollama}</h2>
          <div>
            <label className="label" htmlFor="ollama_url">{t.settings.ollamaUrl}</label>
            <input id="ollama_url" name="ollama_url" className="input mono" defaultValue={settings.ollama_url} />
          </div>
          <div>
            <label className="label" htmlFor="ollama_model">{t.settings.model}</label>
            <input id="ollama_model" name="ollama_model" className="input mono" defaultValue={settings.ollama_model} list="model-suggest" />
            <datalist id="model-suggest">
              {["llama3.1", "llama3.2", "qwen2.5:7b", "mistral", "gemma3", "phi4"].map((m) => <option key={m} value={m} />)}
            </datalist>
          </div>
          <OllamaCheck url={settings.ollama_url} />
          <div className="flex justify-end"><SaveButton label={t.common.save} savedLabel={t.common.saved} /></div>
        </form>

        <div className="space-y-6">
          <section className="card p-5 rise" style={{ ["--i" as string]: 2 }}>
            <h2 className="text-xl mb-3">{t.common.language} / {t.common.theme}</h2>
            <div className="flex items-center gap-2">
              <LangToggle />
              <ThemeToggle current={theme} />
              <span className="text-sm text-muted">{t.common[theme]}</span>
            </div>
          </section>
          <section className="card p-5 rise" style={{ ["--i" as string]: 3 }}>
            <h2 className="text-xl mb-3">{t.settings.data}</h2>
            <DataTools />
          </section>
          <section className="card p-5 rise" style={{ ["--i" as string]: 4 }}>
            <h2 className="text-xl mb-2">{t.settings.about}</h2>
            <p className="text-sm text-ink-2">{t.settings.aboutText}</p>
          </section>
        </div>
      </div>
    </>
  );
}
