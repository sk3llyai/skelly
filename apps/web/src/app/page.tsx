export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '4rem',
        maxWidth: 680,
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>Skelly</h1>
      <p style={{ color: '#555', marginTop: 0 }}>
        Commercial operating system for bid &amp; tender teams.
      </p>
      <p style={{ color: '#888' }}>
        Phase&nbsp;0 — empty shell. Authentication, multi-tenancy and row-level security land next.
      </p>
    </main>
  );
}
