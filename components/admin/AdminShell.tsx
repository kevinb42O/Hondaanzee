import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminShellProps {
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
}

const AdminShell: React.FC<AdminShellProps> = ({ backHref, backLabel, children }) => (
  <div className="admin-page">
    <div className="admin-shell">
      <Link
        to={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </Link>
      {children}
    </div>
  </div>
);

export default AdminShell;
