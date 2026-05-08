import React, { useState } from 'react';
import './AdventureGame.css';

const SCENARIOS = {
  ceoFraud: {
    title: "Scenario 1: The Urgent Request",
    description: "A high-stakes decision involving your CEO and a supposed client emergency.",
    nodes: {
      start: {
        text: "You are working late on a Friday. You receive a Slack message from the 'CEO':\n\n'Hey, I'm stuck in a meeting with a client and my corporate card was declined. I need you to purchase five $100 Apple Gift Cards immediately and send me the codes. I'll reimburse you Monday. Don't call me, I can't speak right now.'",
        choices: [
          { text: "[ BUY CARDS ] Comply with the request to help the CEO.", next: "buyCards" },
          { text: "[ REPLY ] Send a Slack message back asking for clarification.", next: "replySlack" },
          { text: "[ CALL ] Call the CEO on their verified phone number.", next: "callCEO" }
        ]
      },
      buyCards: {
        isEnd: true,
        success: false,
        title: "BREACH DETECTED: Financial Loss",
        text: "You bought the gift cards and sent the codes. The attacker immediately redeemed them and vanished. You fell for 'CEO Fraud' (Business Email Compromise). The attacker exploited your inherent trust in authority and created a false sense of urgency to bypass your critical thinking."
      },
      replySlack: {
        text: "The 'CEO' replies instantly: 'There is no time to explain! If I don't get these cards in 5 minutes, we lose a $50k account. Just do it!'",
        choices: [
          { text: "[ APOLOGIZE & BUY ] Buy the cards immediately.", next: "buyCards" },
          { text: "[ ESCALATE ] Ignore the 'do not call' order and call the CEO anyway.", next: "callCEO" }
        ]
      },
      callCEO: {
        isEnd: true,
        success: true,
        title: "THREAT NEUTRALIZED",
        text: "You call the CEO's actual number. They answer and say they have no idea what you're talking about and are definitely not in a meeting. You have successfully identified a compromised Slack account and stopped a financial attack! Always verify urgent financial requests out-of-band."
      }
    }
  },
  hrUpdate: {
    title: "Scenario 2: The Mandatory Update",
    description: "An email arrives from HR demanding you read a new policy.",
    nodes: {
      start: {
        text: "An email drops into your inbox with the subject: 'URGENT: Updated 2026 Remote Work Policy'.\n\nThe sender is 'human-resources@company-portal.net'. The email contains a link to download a PDF file and states that failure to sign the document within 24 hours will result in immediate suspension of remote work privileges.",
        choices: [
          { text: "[ DOWNLOAD ] Click the link to review the PDF.", next: "downloadPdf" },
          { text: "[ CHECK DOMAIN ] Hover over the sender address to inspect it.", next: "checkDomain" },
          { text: "[ ASK MANAGER ] Forward the email to your manager to ask if it's real.", next: "forwardEmail" }
        ]
      },
      downloadPdf: {
        isEnd: true,
        success: false,
        title: "BREACH DETECTED: Malware Infection",
        text: "The 'PDF' was actually an executable file. The moment you opened it, ransomware began silently encrypting your hard drive. The attacker successfully used fear (losing remote work) to force you into a hasty action."
      },
      forwardEmail: {
        text: "You forward the email to your manager. An hour later, they reply: 'I haven't heard anything about this, but you better check just in case.'",
        choices: [
          { text: "[ DOWNLOAD ] Open the PDF just in case.", next: "downloadPdf" },
          { text: "[ VERIFY HR ] Open the actual company intranet site to look for the policy.", next: "verifyIntranet" }
        ]
      },
      checkDomain: {
        text: "You notice the sender domain is 'company-portal.net'. Your actual company domain is 'company.com'.",
        choices: [
          { text: "[ REPORT ] Click the 'Report Phishing' button in your email client.", next: "reportPhish" },
          { text: "[ IGNORE ] Delete the email and move on.", next: "ignoreEmail" }
        ]
      },
      verifyIntranet: {
        text: "You check the company intranet. There is no mention of a new remote work policy.",
        choices: [
          { text: "[ REPORT ] Report the email as phishing.", next: "reportPhish" }
        ]
      },
      ignoreEmail: {
        isEnd: true,
        success: false,
        title: "THREAT MISSED",
        text: "You successfully avoided the trap, but because you didn't report it, three of your colleagues fell for the exact same email an hour later. Always report suspected phishing so the security team can block the attack globally."
      },
      reportPhish: {
        isEnd: true,
        success: true,
        title: "THREAT NEUTRALIZED",
        text: "Excellent work. You identified the spoofed domain and reported it. The security team immediately blacklisted the sender and deleted the email from all other employee inboxes before anyone else could click it."
      }
    }
  },
  itHelpdesk: {
    title: "Scenario 3: The IT Helpdesk",
    description: "A phone call from the 'Helpdesk' asking to resolve a login issue.",
    nodes: {
      start: {
        text: "Your phone rings. The Caller ID says 'IT Support Desk'.\n\nYou answer, and a friendly voice says: 'Hey, this is Dave from IT. We're migrating the VPN servers and we need to re-sync your 2FA app. I just sent a push notification to your phone, can you hit Approve for me?'",
        choices: [
          { text: "[ APPROVE ] Look at your phone and tap 'Approve' to help Dave.", next: "approvePrompt" },
          { text: "[ QUESTION ] Ask Dave what his employee ID is.", next: "askId" },
          { text: "[ HANG UP ] Hang up and call the official IT Helpdesk number.", next: "callHelpdesk" }
        ]
      },
      approvePrompt: {
        isEnd: true,
        success: false,
        title: "BREACH DETECTED: MFA Defeated",
        text: "You tapped 'Approve'. The attacker, who already had your stolen password, just used you to bypass your Multi-Factor Authentication. This is called an 'MFA Fatigue' or 'Vishing' attack."
      },
      askId: {
        text: "Dave sounds annoyed. 'Come on man, I'm swamped with tickets here. Look, if you don't approve it, your account is going to be locked out until Monday. Just hit the button.'",
        choices: [
          { text: "[ APPROVE ] Tap 'Approve' so you don't get locked out.", next: "approvePrompt" },
          { text: "[ HANG UP ] Hang up the phone.", next: "callHelpdesk" }
        ]
      },
      callHelpdesk: {
        isEnd: true,
        success: true,
        title: "THREAT NEUTRALIZED",
        text: "You hang up and dial the official internal IT number. The real IT department confirms they are not doing any VPN migrations. You successfully defeated a Vishing (Voice Phishing) attack by refusing to act on inbound urgency and verifying through an official channel!"
      }
    }
  }
};

export default function AdventureGame() {
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState('start');

  const handleSelectScenario = (id) => {
    setActiveScenarioId(id);
    setCurrentNodeId('start');
  };

  const handleChoice = (nextNodeId) => {
    setCurrentNodeId(nextNodeId);
  };

  const handleReset = () => {
    setActiveScenarioId(null);
    setCurrentNodeId('start');
  };

  if (!activeScenarioId) {
    return (
      <div className="simulator-container pane">
        <div className="panel-bar">
          <span className="panel-title">// incident_simulator.exe</span>
          <div className="window-dots" aria-hidden>
            <span /><span /><span />
          </div>
        </div>
        <div className="panel-body">
          <h1 style={{ color: 'var(--blue)', fontFamily: 'var(--mono)', fontSize: '24px', marginBottom: '10px' }}>
            SOCIAL ENGINEERING SIMULATOR
          </h1>
          <p style={{ color: 'var(--text2)', marginBottom: '30px', fontSize: '15px' }}>
            Select an incident scenario to test your response tactics. Every choice has consequences.
          </p>

          <div className="scenario-list">
            {Object.entries(SCENARIOS).map(([id, scenario]) => (
              <div key={id} className="scenario-card" onClick={() => handleSelectScenario(id)}>
                <h3 className="scenario-title">{scenario.title}</h3>
                <p className="scenario-desc">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scenario = SCENARIOS[activeScenarioId];
  const node = scenario.nodes[currentNodeId];

  return (
    <div className="simulator-container pane">
      <div className="panel-bar">
        <span className="panel-title">// {activeScenarioId} :: node_{currentNodeId}</span>
        <div className="window-dots" aria-hidden>
          <span /><span /><span />
        </div>
      </div>
      <div className="panel-body">
        
        {!node.isEnd ? (
          <div className="story-node" key={currentNodeId}>
            <div className="story-text">{node.text}</div>
            <div className="choices-grid">
              {node.choices.map((choice, idx) => (
                <button 
                  key={idx} 
                  className="choice-btn"
                  onClick={() => handleChoice(choice.next)}
                >
                  {choice.text}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleReset}
              style={{ marginTop: '40px', background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px', textDecoration: 'underline' }}
            >
              ABORT SCENARIO
            </button>
          </div>
        ) : (
          <div className={`feedback-node ${node.success ? 'success' : 'failure'}`}>
            <h2 className="feedback-title">{node.title}</h2>
            <p className="feedback-text">{node.text}</p>
            <button className="btn-primary" onClick={handleReset}>
              RETURN TO SCENARIO SELECT
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
