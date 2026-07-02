'use client';

import { useEffect, useMemo, useState } from 'react';
import { socket } from '@/lib/socket';

const roles = ['Admin', 'Mentor', 'Team Lead', 'Intern'];

export function PortalOverview() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  const stack = useMemo(
    () => [
      'Next.js + React + TypeScript + Tailwind CSS',
      'Node.js + Express.js',
      'PostgreSQL + Prisma ORM',
      'JWT Authentication + RBAC',
      'Socket.IO real-time collaboration'
    ],
    []
  );

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'}/health`);
        setApiStatus(response.ok ? 'Online' : 'Unavailable');
      } catch {
        setApiStatus('Unavailable');
      }
    };

    checkApi();
  }, []);

  useEffect(() => {
    const onConnect = () => setApiStatus((value) => (value === 'Online' ? 'Online (socket connected)' : value));
    socket.on('connect', onConnect);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.disconnect();
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6 md:p-10">
      <header>
        <h1 className="text-3xl font-bold">Internship Management, Collaboration & Mentorship Portal</h1>
        <p className="mt-2 text-slate-300">System status: {apiStatus}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Role-based access control</h2>
          <ul className="mt-3 space-y-2 text-slate-300">
            {roles.map((role) => (
              <li key={role}>• {role}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Technology stack</h2>
          <ul className="mt-3 space-y-2 text-slate-300">
            {stack.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">Scalable architecture</h2>
        <p className="mt-2 text-slate-300">
          The project is organized into <code>frontend/</code> and <code>backend/</code> with modular routing,
          middleware, auth, RBAC utilities, and a dedicated Socket.IO layer.
        </p>
      </section>
    </main>
  );
}
