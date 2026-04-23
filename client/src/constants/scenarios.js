export const SCENARIOS = [
  {
    id: 1,
    type: 'URL',
    content: 'https://www.paypal-security-update.com/login',
    isPhishing: true,
    explanation: 'The domain is "paypal-security-update.com", not "paypal.com". Attackers often register hyphenated domains to trick users.'
  },
  {
    id: 2,
    type: 'EMAIL',
    content: 'From: it-support@micros0ft.com\nSubject: Password Expiry\n\nYour Office365 password expires in 2 hours. Click here to retain your current password: http://login-microsoft-auth.net',
    isPhishing: true,
    explanation: 'The sender uses a zero instead of an "o" (micros0ft). The link also leads to a fake domain instead of a real Microsoft portal.'
  },
  {
    id: 3,
    type: 'URL',
    content: 'https://github.com/settings/security',
    isPhishing: false,
    explanation: 'This is the legitimate URL for GitHub. It uses HTTPS and the correct domain name.'
  },
  {
    id: 4,
    type: 'SMS',
    content: 'USPS: Your package is on hold due to unpaid customs fees of $1.99. Pay now to release your shipment: https://usps-tracking-info.com',
    isPhishing: true,
    explanation: 'USPS does not send unsolicited text messages with links for payments. The domain is also completely fake.'
  },
  {
    id: 5,
    type: 'EMAIL',
    content: 'From: hr@yourcompany.com\nSubject: Q3 Bonus Structure\n\nPlease review the attached PDF for the updated Q3 bonus structure. \n\nAttachment: Q3_Bonus_Details.pdf.exe',
    isPhishing: true,
    explanation: 'The attachment ends in ".exe" disguised as a PDF. This is a classic malware delivery mechanism.'
  },
  {
    id: 6,
    type: 'URL',
    content: 'https://myaccount.google.com/security',
    isPhishing: false,
    explanation: 'This is the legitimate domain for Google Account management.'
  },
  {
    id: 7,
    type: 'URL',
    content: 'http://netflix.com.billing-update.info/login',
    isPhishing: true,
    explanation: 'The actual domain is "billing-update.info". "netflix.com" is just a subdomain created by the attacker.'
  },
  {
    id: 8,
    type: 'SMS',
    content: 'Chase Bank: A login attempt was blocked from Moscow, RU. If this wasn\'t you, secure your account at https://chase-fraud-alert.com',
    isPhishing: true,
    explanation: 'Banks do not use third-party sounding domains like "chase-fraud-alert.com". They direct you to their main app or site.'
  },
  {
    id: 9,
    type: 'EMAIL',
    content: 'From: no-reply@spotify.com\nSubject: Welcome to Spotify Premium\n\nThanks for upgrading. Your receipt is attached.',
    isPhishing: false,
    explanation: 'This is a standard transactional email from a legitimate domain. While always good to verify, there are no immediate red flags here.'
  },
  {
    id: 10,
    type: 'URL',
    content: 'https://www.apple.com/shop/bag',
    isPhishing: false,
    explanation: 'This is the legitimate URL for the Apple Store shopping bag.'
  }
];
