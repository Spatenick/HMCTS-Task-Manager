export default function Banner({ type = 'error', children }) {
  return (
    <div className={`banner banner-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
