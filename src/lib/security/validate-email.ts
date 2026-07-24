import disposableDomains from 'disposable-email-domains';

export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return true;
  
  const domain = email.split('@')[1].toLowerCase().trim();
  return disposableDomains.includes(domain);
}
