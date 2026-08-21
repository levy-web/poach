export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-stack-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="mb-1 font-headline-lg text-headline-lg text-on-surface">{title}</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
