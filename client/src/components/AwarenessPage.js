import React, { useState } from 'react';
import './AwarenessPage.css';

const TABS = [
  { id: 'definition', label: '// DEFINITION' },
  { id: 'identification', label: '// IDENTIFICATION' },
  { id: 'types', label: '// COMMON TYPES' },
  { id: 'prevention', label: '// PREVENTION' }
];

export default function AwarenessPage() {
  const [activeTab, setActiveTab] = useState('definition');

  return (
    <div className="awareness-container">
      <div className="awareness-sidebar pane">
        <div className="panel-bar">
          <span className="panel-title">// modules</span>
        </div>
        <div className="panel-body sidebar-nav">
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
          {activeTab === 'definition' && <DefinitionContent />}
          {activeTab === 'identification' && <IdentificationContent />}
          {activeTab === 'types' && <TypesContent />}
          {activeTab === 'prevention' && <PreventionContent />}
        </div>
      </div>
    </div>
  );
}

function DefinitionContent() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">What is Phishing?</h2>
      <p className="aw-text">
        Phishing is a type of social engineering attack often used to steal user data, including login credentials and credit card numbers. It occurs when an attacker, masquerading as a trusted entity, dupes a victim into opening an email, instant message, or text message.
      </p>
      <div className="aw-alert">
        <strong>CRITICAL SEVERITY:</strong> Phishing is the most common form of cybercrime. In a typical attack, the recipient is tricked into clicking a malicious link, which can lead to the installation of malware or the freezing of the system as part of a ransomware attack.
      </div>
      <h3 className="aw-subtitle">The Anatomy of an Attack</h3>
      <ul className="aw-list">
        <li><strong>Lure:</strong> The attacker creates a compelling message designed to provoke fear, curiosity, or urgency.</li>
        <li><strong>Hook:</strong> The victim acts on the message, clicking a link or downloading an attachment.</li>
        <li><strong>Catch:</strong> The attacker harvests the credentials or installs malware on the victim's machine.</li>
      </ul>
    </div>
  );
}

function IdentificationContent() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">How to Identify Phishing</h2>
      <p className="aw-text">
        Modern phishing attacks are increasingly sophisticated, but they often leave subtle clues. By analyzing the structural components of a message, you can identify malicious intent.
      </p>
      <h3 className="aw-subtitle">Common Red Flags</h3>
      <div className="aw-grid">
        <div className="aw-card">
          <h4>1. Urgent or Threatening Language</h4>
          <p>Phrases like "Your account will be suspended" or "Act immediately" are designed to cause panic and bypass logical thinking.</p>
        </div>
        <div className="aw-card">
          <h4>2. Mismatched URLs</h4>
          <p>The visible link text may say "paypal.com" but hovering reveals a different domain entirely (e.g., "paypa1-security-update.com").</p>
        </div>
        <div className="aw-card">
          <h4>3. Suspicious Sender Address</h4>
          <p>Attackers often use cousin domains. An email claiming to be from Microsoft might come from "support@micr0soft-update.net".</p>
        </div>
        <div className="aw-card">
          <h4>4. Requests for Sensitive Info</h4>
          <p>Legitimate organizations rarely ask for your password, SSN, or full credit card number via email or text.</p>
        </div>
      </div>
      
      <h3 className="aw-subtitle">Example of a Phishing Attempt</h3>
      <div className="aw-code-block">
        <div className="code-header">From: admin@bank-security-alerts.com</div>
        <div className="code-body">
          <p>Dear Valued Customer,</p>
          <p>We have detected unusual activity on your account. Please click the link below to verify your identity immediately, or your account will be permanently locked.</p>
          <br/>
          <p style={{color: "var(--blue)", textDecoration: "underline"}}>http://secure-login-update-65a2.com/verify</p>
        </div>
      </div>
    </div>
  );
}

function TypesContent() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Common Types of Phishing</h2>
      <p className="aw-text">
        Phishing isn't limited to generic emails. Attackers use various channels and targeting strategies to maximize their success rate.
      </p>
      
      <div className="aw-type-block">
        <h3>&gt; Spear Phishing</h3>
        <p>Highly targeted attacks aimed at specific individuals or companies. Attackers gather personal information from social media to make their emails highly convincing and contextual.</p>
      </div>

      <div className="aw-type-block">
        <h3>&gt; Whaling</h3>
        <p>A specialized form of spear phishing targeting high-profile executives (C-level) to steal sensitive corporate data or initiate fraudulent wire transfers.</p>
      </div>

      <div className="aw-type-block">
        <h3>&gt; Smishing (SMS Phishing)</h3>
        <p>Phishing attacks executed via text message. These often contain short URLs and claim to be package delivery notifications or bank alerts.</p>
      </div>

      <div className="aw-type-block">
        <h3>&gt; Vishing (Voice Phishing)</h3>
        <p>Telephone-based phishing where the attacker impersonates a trusted authority (like the IRS or tech support) to extract information verbally.</p>
      </div>
    </div>
  );
}

function PreventionContent() {
  return (
    <div className="aw-module">
      <h2 className="aw-title">Defense Mechanisms & Prevention</h2>
      <p className="aw-text">
        A defense-in-depth strategy is required to mitigate the risk of phishing. Combining technical controls with user awareness yields the best results.
      </p>
      
      <h3 className="aw-subtitle">Best Practices</h3>
      <ul className="aw-list">
        <li><strong>Enable Multi-Factor Authentication (MFA):</strong> Even if an attacker compromises your password, they cannot access your account without the second factor.</li>
        <li><strong>Use a Password Manager:</strong> Password managers auto-fill credentials only on the correct, verified domain, effectively neutralizing credential harvesting on fake sites.</li>
        <li><strong>Verify Out-of-Band:</strong> If you receive a suspicious email from a colleague or bank, contact them directly via a known, trusted phone number or new email thread.</li>
      </ul>

      <div className="aw-alert" style={{borderColor: 'var(--green3)', background: 'rgba(0, 255, 136, 0.08)'}}>
        <strong style={{color: 'var(--green)'}}>SYSTEM ADVISORY:</strong> 
        Always utilize the <strong>PHISHGUARD Scanner</strong> to analyze suspicious URLs, Emails, and Attachments before interacting with them. Our machine learning models and threat intelligence integrations provide an immediate risk assessment.
      </div>
    </div>
  );
}
