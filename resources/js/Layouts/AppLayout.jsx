import Sidebar from '../Components/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

/* Usage in any Inertia page, e.g. resources/js/Pages/Dashboard.jsx:

import AppLayout from '../Layouts/AppLayout';

export default function Dashboard() {
  return (
    <AppLayout>
      <h1>Dashboard</h1>
    </AppLayout>
  );
}

Dashboard.layout = page => page; // or wrap manually as shown above
*/
