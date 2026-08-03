import Sidebar from './Sidebar';

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--bg)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0, 
        overflow: 'hidden',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  );
}