import PageHeader from "@/components/PageHeader";
import { logout } from "@/lib/auth-actions";
import { getCurrentUser } from "@/lib/dal";

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-surface-container-highest bg-surface-container-lowest p-stack-lg shadow-standard">
      <div className="mb-stack-md flex items-start gap-3 border-b border-surface-container-high pb-4">
        <div className="rounded-md bg-primary-fixed p-2 text-zest-orange">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <h3 className="font-title-md text-title-md text-on-surface">{title}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-surface-container-high py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-md text-body-md text-on-surface">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  // The dashboard layout already rejects unauthenticated or non-staff users;
  // this call is deduped with the layout's by `cache()` in the DAL.
  const user = await getCurrentUser();

  return (
    <div className="p-margin-page">
      <PageHeader title="Settings" subtitle="Your admin account and session preferences." />

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <Section
          title="Account"
          description="Details for the account you're signed in with."
          icon="person"
        >
          <Field label="Full name" value={user?.full_name ?? "—"} />
          <Field label="Phone number" value={user?.phone_number ?? "—"} />
          <Field label="Role" value={user?.is_staff ? "Administrator" : "Standard user"} />
          <Field
            label="Phone verified"
            value={
              user?.is_phone_verified ? (
                <span className="flex w-fit items-center gap-1 rounded-full bg-green-50 px-2 py-1 font-label-sm text-label-sm text-green-700">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Verified
                </span>
              ) : (
                <span className="flex w-fit items-center gap-1 rounded-full bg-error-container/40 px-2 py-1 font-label-sm text-label-sm text-on-error-container">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  Not verified
                </span>
              )
            }
          />
        </Section>

        <Section
          title="Session"
          description="How long you stay signed in on this device."
          icon="schedule"
        >
          <Field label="Access token lifetime" value="30 minutes" />
          <Field label="Stay signed in for" value="30 days" />
          <Field label="Token renewal" value="Automatic, in the background" />
          <p className="pt-4 font-body-sm text-body-sm text-on-surface-variant">
            Your access token is renewed automatically as you browse, so you stay signed in until
            you sign out or your 30-day session expires.
          </p>
        </Section>

        <Section
          title="Security"
          description="Password and account recovery."
          icon="lock"
        >
          <p className="font-body-md text-body-md text-on-surface-variant">
            Passwords are reset with a one-time code sent by SMS to{" "}
            <span className="text-on-surface">{user?.phone_number ?? "your number"}</span>. Use the
            “Forgot Password?” link on the sign-in screen to start that flow.
          </p>
        </Section>

        <Section
          title="Sign out"
          description="End this session on this device."
          icon="logout"
        >
          <p className="mb-stack-md font-body-md text-body-md text-on-surface-variant">
            Signing out revokes this device&apos;s session on the server — it can&apos;t be reused
            afterwards.
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-zest-orange px-6 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign out
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}
