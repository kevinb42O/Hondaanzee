import React from 'react';

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  sessionEmail?: string;
  actions?: React.ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  sessionEmail,
  actions,
}) => (
  <section className="admin-surface p-5 sm:p-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
        <h1 className="admin-title">{title}</h1>
        <p className="admin-subtitle">{subtitle}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:min-w-[340px] lg:items-end">
        {sessionEmail ? (
          <div className="admin-surface-subtle w-full px-4 py-3 lg:max-w-[320px]">
            <p className="admin-eyebrow">Ingelogd als</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{sessionEmail}</p>
          </div>
        ) : null}
        {actions ? <div className="flex w-full flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </div>
  </section>
);

export default AdminPageHeader;
