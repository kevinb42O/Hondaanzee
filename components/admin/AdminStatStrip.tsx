import React from 'react';

interface AdminStatItem {
  label: string;
  value: string;
}

interface AdminStatStripProps {
  items: AdminStatItem[];
}

const AdminStatStrip: React.FC<AdminStatStripProps> = ({ items }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <div key={item.label} className="admin-surface-subtle px-3.5 py-2.5">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{item.value}</p>
      </div>
    ))}
  </div>
);

export default AdminStatStrip;
