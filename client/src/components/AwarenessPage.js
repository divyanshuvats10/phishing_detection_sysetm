import React, { useState } from 'react';
import './AwarenessPage.css';

const TABS = [
  { id: 'module1', label: '// MODULE 1: Basics' },
  { id: 'module2', label: '// MODULE 2: Email' },
  { id: 'module3', label: '// MODULE 3: URLs' },
  { id: 'module4', label: '// MODULE 4: Psychology' },
  { id: 'module5', label: '// MODULE 5: Variants' },
  { id: 'module6', label: '// MODULE 6: AI/Deepfake' },
  { id: 'module7', label: '// MODULE 7: Response' }
];

export default function AwarenessPage() {
  const [activeTab, setActiveTab] = useState('module1');

  return (
    <div className="awareness-container">
      <div className="awareness-sidebar pane">
        <div className="panel-bar">
          <span className="panel-title">// training_program</span>
        </div>
        <div className="panel-body sidebar-nav">
          <div style={{ padding: '0 15px 15px', color: 'var(--blue)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            7-Module Cybersecurity Education Series
          </div>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="awareness-content pane">
        <div className="panel-bar">
          <span className="panel-title">
            // sys_manual :: {activeTab}
          </span>
          <div className="window-dots" aria-hidden>
            <span /><span /><span />
          </div>
        </div>
        <div className="panel-body scrollable-content">
          {activeTab === 'module1' && <Module1 />}
          {activeTab === 'module2' && <Module2 />}
          {activeTab === 'module3' && <Module3 />}
          {activeTab === 'module4' && <Module4 />}
          {activeTab === 'module5' && <Module5 />}
          {activeTab === 'module6' && <Module6 />}
          {activeTab === 'module7' && <Module7 />}
        </div>
      </div>
    </div>
  );
}

function Module1() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Module 1 — Understanding Phishing</h2>
      <h3 className="aw-subtitle">What is Phishing?</h3>
      <p className="aw-text">
        Phishing is a cyberattack where attackers impersonate trusted individuals or organizations to steal sensitive information such as passwords, banking details, OTPs, or personal data. Attacks typically arrive via email, websites, SMS, or social media.
      </p>
      <p className="aw-text">
        The attacker's goal is manipulation — exploiting human trust, urgency, fear, and curiosity rather than breaking into systems technically. Modern phishing campaigns often imitate:
      </p>
      <ul className="aw-list">
        <li>Banks and financial institutions</li>
        <li>Universities and educational portals</li>
        <li>Delivery and courier services</li>
        <li>Government portals</li>
        <li>Recruiters and HR departments</li>
        <li>Cloud platforms (Microsoft, Google, etc.)</li>
      </ul>
      
      <h3 className="aw-subtitle">Warning Signs</h3>
      <ul className="aw-list">
        <li>Urgent or alarming language</li>
        <li>Fake login pages mimicking real websites</li>
        <li>Suspicious or mismatched links</li>
        <li>Requests for credentials or OTPs</li>
        <li>Unusual email attachments</li>
        <li>Spoofed sender addresses</li>
      </ul>

      <div className="aw-alert">
        <strong>KEY TAKEAWAY:</strong> Phishing attacks succeed because they target human behavior more than technology.
      </div>

      <h3 className="aw-subtitle">Sources</h3>
      <ul className="aw-list">
        <li><a href="https://www.cisa.gov/stopransomware/phishing" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>CISA Phishing Guidance</a></li>
        <li><a href="https://apwg.org/" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>APWG Phishing Trends Reports</a></li>
        <li><a href="https://www.ibm.com/topics/phishing" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>IBM Phishing Overview</a></li>
      </ul>
    </div>
  );
}

function Module2() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Module 2 — How Email Phishing Works</h2>
      <h3 className="aw-subtitle">Email-Based Phishing</h3>
      <p className="aw-text">
        Email phishing is the most common form of phishing attack. Attackers send deceptive emails that appear legitimate, impersonating trusted organizations to pressure users into clicking malicious links or downloading harmful attachments.
      </p>

      <h3 className="aw-subtitle">Emotional Triggers Used by Attackers</h3>
      <ul className="aw-list">
        <li><strong>Urgency:</strong> 'Your account will be suspended in 24 hours'</li>
        <li><strong>Fear:</strong> 'Unauthorized access detected on your account'</li>
        <li><strong>Authority:</strong> Messages appearing from a boss, bank, or government</li>
        <li><strong>Rewards:</strong> 'You have won a prize, claim now'</li>
        <li><strong>Curiosity:</strong> 'See who viewed your profile'</li>
      </ul>

      <h3 className="aw-subtitle">Warning Signs</h3>
      <ul className="aw-list">
        <li>Suspicious sender domain (e.g. <code>support-paypal-secure.com</code> vs <code>paypal.com</code>)</li>
        <li>Urgent or threatening subject lines</li>
        <li>Malware hidden in PDF, ZIP, or Office attachments</li>
        <li>Links that don't match the displayed text</li>
        <li>Generic greetings like 'Dear Customer' instead of your name</li>
      </ul>

      <div className="aw-code-block">
        <div className="code-header">Sender Domain Example</div>
        <div className="code-body">
          <p><strong>REAL:</strong> support@paypal.com</p>
          <p style={{color: 'var(--red)'}}><strong>FAKE:</strong> support-paypal-secure.com</p>
        </div>
      </div>

      <div className="aw-alert">
        <strong>KEY TAKEAWAY:</strong> Never trust an email solely because it looks professional.
      </div>

      <h3 className="aw-subtitle">Sources</h3>
      <ul className="aw-list">
        <li><a href="https://www.microsoft.com/en-us/security/business/security-101/what-is-phishing" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>Microsoft Phishing Protection Guide</a></li>
        <li><a href="https://www.proofpoint.com/us/threat-reference/phishing" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>Proofpoint Threat Reference</a></li>
        <li><a href="https://www.cloudflare.com/learning/access-management/phishing-attacks/" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>Cloudflare Email Security Guide</a></li>
      </ul>
    </div>
  );
}

function Module3() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Module 3 — Understanding Malicious URLs</h2>
      <h3 className="aw-subtitle">What Makes a URL Suspicious?</h3>
      <p className="aw-text">
        Phishing websites use deceptive URLs to trick users into believing they are visiting legitimate sites. Attackers commonly imitate brand names, add extra subdomains, use shortened links, replace letters with similar characters, or create fake HTTPS pages.
      </p>

      <div className="aw-code-block" style={{marginBottom: '20px'}}>
        <div className="code-header">URL Example</div>
        <div className="code-body">
          <p><strong>LEGITIMATE:</strong> amazon.com</p>
          <p style={{color: 'var(--red)'}}><strong>PHISHING:</strong> amaz0n-security-login.com</p>
        </div>
      </div>

      <h3 className="aw-subtitle">Common URL Tricks</h3>
      <div className="aw-grid">
        <div className="aw-card">
          <h4>1. Typosquatting</h4>
          <p>Small spelling mistakes like <code>faceboook.com</code> or <code>paypa1.com</code>. Attackers register domains with tiny misspellings hoping users don't notice.</p>
        </div>
        <div className="aw-card">
          <h4>2. Homograph Attacks</h4>
          <p>Replacing characters with visually similar symbols. E.g. using the Cyrillic 'a' instead of the Latin 'a' — looks identical but is a different URL.</p>
        </div>
        <div className="aw-card">
          <h4>3. URL Shorteners</h4>
          <p>Bit.ly or TinyURL links can mask a malicious domain entirely, hiding the final destination.</p>
        </div>
        <div className="aw-card">
          <h4>4. Fake Subdomains</h4>
          <p><code>paypal.com.malicious-site.net</code> (the real domain is malicious-site.net, not paypal.com).</p>
        </div>
      </div>

      <h3 className="aw-subtitle">Safe Practices</h3>
      <ul className="aw-list">
        <li>Hover over links before clicking to preview the real destination</li>
        <li>Check domain spelling carefully — look at the root domain, not just the start</li>
        <li>Avoid unknown shortened links; use a URL expander to check first</li>
        <li>Verify HTTPS AND domain authenticity — HTTPS alone does not guarantee safety</li>
      </ul>

      <div className="aw-alert">
        <strong>KEY TAKEAWAY:</strong> HTTPS alone does NOT guarantee a website is safe.
      </div>

      <h3 className="aw-subtitle">Sources</h3>
      <ul className="aw-list">
        <li><a href="https://owasp.org/www-community/attacks/Phishing" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>OWASP Phishing Attack Guide</a></li>
        <li><a href="https://safebrowsing.google.com/" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>Google Safe Browsing</a></li>
        <li><a href="https://www.virustotal.com/gui/home/url" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>VirusTotal URL Scanner</a></li>
      </ul>
    </div>
  );
}

function Module4() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Module 4 — Social Engineering Psychology</h2>
      <h3 className="aw-subtitle">Why Do People Fall for Phishing?</h3>
      <p className="aw-text">
        Phishing attacks succeed because they exploit human psychology. Attackers carefully craft messages to trigger emotional reactions before the target has time to think logically.
      </p>

      <div className="aw-grid">
        <div className="aw-card">
          <h4>Fear</h4>
          <p>'Your bank account has been compromised.'</p>
        </div>
        <div className="aw-card">
          <h4>Urgency</h4>
          <p>'Respond within 10 minutes or your account will be closed.'</p>
        </div>
        <div className="aw-card">
          <h4>Authority</h4>
          <p>Fake emails from professors, managers, or government officials.</p>
        </div>
        <div className="aw-card">
          <h4>Greed</h4>
          <p>'You have been selected for a $500 reward.'</p>
        </div>
      </div>

      <h3 className="aw-subtitle">How Manipulation Works</h3>
      <p className="aw-text">
        Attackers use a simple formula: trigger an emotion, then present an action. The emotional state makes users skip verification steps they would normally follow.
      </p>
      <ul className="aw-list">
        <li><strong>Step 1:</strong> Trigger fear ('Your account is at risk.')</li>
        <li><strong>Step 2:</strong> Create urgency ('Act now within 15 minutes.')</li>
        <li><strong>Step 3:</strong> Provide a fake solution ('Click here to secure your account.')</li>
        <li><strong>Step 4:</strong> Harvest credentials on a fake login page.</li>
      </ul>

      <div className="aw-alert">
        <strong>KEY TAKEAWAY:</strong> Emotional reactions often override security awareness — pause and verify before acting.
      </div>

      <h3 className="aw-subtitle">Sources</h3>
      <ul className="aw-list">
        <li><a href="https://www.ibm.com/topics/social-engineering" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>IBM Social Engineering Guide</a></li>
        <li><a href="https://us.norton.com/blog/emerging-threats/social-engineering" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>Norton Social Engineering Overview</a></li>
        <li><a href="https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>CISA Social Engineering Awareness</a></li>
      </ul>
    </div>
  );
}

function Module5() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Module 5 — Smishing, Vishing & QR Phishing</h2>
      <h3 className="aw-subtitle">Modern Phishing Beyond Email</h3>
      <p className="aw-text">
        Phishing attacks now extend far beyond traditional email. Any communication platform can be weaponized. Understanding these variants is essential for complete security awareness.
      </p>

      <div className="aw-type-block">
        <h3>&gt; Smishing (SMS Phishing)</h3>
        <p>Phishing delivered through SMS text messages. Attackers send fake alerts that appear to come from banks, delivery companies, or government bodies. Common scenarios include fake OTP/verification alerts, parcel delivery notifications with a tracking link, KYC warnings, or lottery wins.</p>
      </div>

      <div className="aw-type-block">
        <h3>&gt; Vishing (Voice Phishing)</h3>
        <p>Phishing conducted over phone calls. Attackers impersonate bank fraud departments, IT support, or government agencies. With AI-generated voice cloning, vishing has become significantly more convincing. Caller ID can be spoofed to show a legitimate number.</p>
      </div>

      <div className="aw-type-block">
        <h3>&gt; Quishing (QR Phishing)</h3>
        <p>Malicious QR codes redirect users to phishing websites. Attackers place these in emails, printed posters, fake parking fines, or even stickers over legitimate QR codes. Users cannot see the destination URL before scanning.</p>
      </div>

      <div className="aw-alert">
        <strong>KEY TAKEAWAY:</strong> Any communication platform — SMS, phone call, or QR code — can become a phishing vector.
      </div>

      <h3 className="aw-subtitle">Sources</h3>
      <ul className="aw-list">
        <li><a href="https://www.fbi.gov/how-we-can-help-you/safety-resources/scams-and-safety/common-scams-and-crimes/spoofing-and-phishing" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>FBI Smishing Warning</a></li>
        <li><a href="https://www.kaspersky.com/resource-center/threats/what-is-smishing-and-how-to-defend-against-it" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>Kaspersky Smishing Guide</a></li>
        <li><a href="https://www.ncsc.gov.uk/collection/phishing-scams" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>NCSC Guidance</a></li>
      </ul>
    </div>
  );
}

function Module6() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Module 6 — AI & Deepfake Phishing</h2>
      <h3 className="aw-subtitle">AI-Powered Phishing Threats</h3>
      <p className="aw-text">
        Artificial intelligence is transforming phishing attacks — making them faster to create, harder to detect, and far more convincing at scale. Modern attackers can now generate highly realistic, grammatically perfect phishing emails, clone voices of executives, and run deepfake video calls.
      </p>

      <h3 className="aw-subtitle">How AI Changes the Threat</h3>
      <p className="aw-text">
        Traditional phishing was often easy to spot due to poor grammar, generic greetings, and obvious fakes. AI eliminates these red flags:
      </p>
      <ul className="aw-list">
        <li>Proper grammar and professional formatting</li>
        <li>Personalized details (your name, company, recent activity)</li>
        <li>Culturally and contextually appropriate language</li>
        <li>Real-time adaptive responses in chat-based attacks</li>
      </ul>

      <h3 className="aw-subtitle">Deepfake Threats</h3>
      <p className="aw-text">
        Deepfake technology allows attackers to fabricate convincing audio and video. These are increasingly used in financial fraud and high-value impersonation attacks:
      </p>
      <ul className="aw-list">
        <li><strong>CEO fraud:</strong> fake video call authorizing a wire transfer</li>
        <li><strong>Family emergency scams:</strong> using cloned voice of a loved one</li>
        <li><strong>Fake identity verification:</strong> in recruitment or onboarding</li>
      </ul>

      <div className="aw-alert">
        <strong>KEY TAKEAWAY:</strong> Modern phishing attacks can appear highly professional and realistic — verify through a second, independent channel.
      </div>

      <h3 className="aw-subtitle">Sources</h3>
      <ul className="aw-list">
        <li><a href="https://www.weforum.org/topics/cybersecurity/" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>World Economic Forum Cybersecurity Insights</a></li>
        <li><a href="https://www.europol.europa.eu/about-europol/european-cybercrime-centre-ec3" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>Europol Cybercrime Reports</a></li>
      </ul>
    </div>
  );
}

function Module7() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Module 7 — What To Do After Encountering Phishing</h2>
      <h3 className="aw-subtitle">Immediate Response Steps</h3>
      <p className="aw-text">
        Quick, correct action after encountering a phishing attempt minimizes damage and helps protect others. Follow these steps immediately.
      </p>

      <div className="aw-grid">
        <div className="aw-card" style={{borderColor: 'var(--red)'}}>
          <h4 style={{color: 'var(--red)'}}>Do NOT</h4>
          <ul>
            <li>Click unknown or suspicious links</li>
            <li>Download or open unexpected attachments</li>
            <li>Enter your credentials on an unverified page</li>
            <li>Reply to the phishing message</li>
          </ul>
        </div>
        <div className="aw-card" style={{borderColor: 'var(--green)'}}>
          <h4 style={{color: 'var(--green)'}}>Do Immediately</h4>
          <ul>
            <li>Change compromised passwords immediately</li>
            <li>Enable Multi-Factor Authentication (MFA)</li>
            <li>Disconnect an infected device from the network</li>
            <li>Notify your organization's security team</li>
          </ul>
        </div>
      </div>

      <h3 className="aw-subtitle">Why Reporting Matters</h3>
      <p className="aw-text">
        Every report helps organizations and security teams act faster. Reporting a phishing attempt:
      </p>
      <ul className="aw-list">
        <li>Allows security teams to block malicious domains</li>
        <li>Warns other users who may receive the same attack</li>
        <li>Builds data that improves future threat detection</li>
        <li>Reduces the overall damage of a phishing campaign</li>
      </ul>

      <div className="aw-alert" style={{borderColor: 'var(--green3)', background: 'rgba(0, 255, 136, 0.08)'}}>
        <strong style={{color: 'var(--green)'}}>SYSTEM ADVISORY:</strong> 
        Always utilize the <strong>PHISHCEASE Scanner</strong> to analyze suspicious URLs, Emails, and Attachments before interacting with them. Our machine learning models and threat intelligence integrations provide an immediate risk assessment.
      </div>

      <h3 className="aw-subtitle">Sources</h3>
      <ul className="aw-list">
        <li><a href="https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/cyber-incident-response" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>CISA Incident Response Resources</a></li>
        <li><a href="https://www.nist.gov/cyberframework" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>NIST Cybersecurity Framework</a></li>
        <li><a href="https://www.sans.org/security-awareness-training/" target="_blank" rel="noreferrer" style={{color: 'var(--green)'}}>SANS Security Awareness Resources</a></li>
      </ul>
    </div>
  );
}
