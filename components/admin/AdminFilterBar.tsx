import React from 'react';

interface AdminFilterBarProps {
  children: React.ReactNode;
}

const AdminFilterBar: React.FC<AdminFilterBarProps> = ({ children }) => (
  <section className="admin-surface sticky top-4 z-20 p-4 sm:p-5">
    {children}
  </section>
);

export default AdminFilterBar;
