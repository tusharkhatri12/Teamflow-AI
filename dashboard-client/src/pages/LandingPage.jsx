import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import Report from '../assets/report.svg'
import Product from '../assets/product-explainer.svg'
import OS from '../assets/os-upgrade.svg'
import { useInView } from 'react-intersection-observer';
const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

function RevealOnScroll({ children, className = '', threshold = 0.15, ...props }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold });
  return (
    <div
      ref={ref}
      className={
        `${className} scroll-reveal` + (inView ? ' revealed' : '')
      }
      {...props}
    >
      {children}
    </div>
  );
}

function Typewriter({ text, highlightStart, highlightClass }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, [text]);

  // Split for highlight
  const before = displayed.slice(0, highlightStart);
  const after = displayed.slice(highlightStart);
  return (
    <h1>
      {before}
      {after && <span className={highlightClass}>{after}</span>}
      <span className="type-cursor">|</span>
    </h1>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">

      <RevealOnScroll className="hero">
        <Typewriter text="COLLABORATE SMARTER." highlightStart={12} highlightClass="highlight" />
        <p className="subtitle">Your AI-powered team workspace.</p>
        <p className="description">Replace endless messages, lost context, and siloed tools. Your team's memory, communication, and workflow—unified.</p>
        <button className="waitlist-btn glow">Join Waitlist</button>
      </RevealOnScroll>

      <RevealOnScroll id="features" className="features-section">
        <h2 className="features-heading">UNLOCK YOUR TEAM’S SUPERPOWERS</h2>
        <RevealOnScroll className="feature-step">
          <div className="step-text">
            <p className="step-number">STEP 1</p>
            <h3 className="step-title">Auto-Summarized Standups</h3>
            <p className="step-description">
              Our AI listens to daily standup updates and generates precise summaries for your entire team. 
              Say goodbye to long Slack threads and hello to instant clarity. Built to save hours and surface insights.
            </p>
          </div>
          <div className="step-illustration">
              <img src={Report} alt="Report" />
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="feature-step">
          <div className="step-text">
            <p className="step-number">STEP 2</p>
            <h3 className="step-title">Context-Aware Messaging</h3>
            <p className="step-description">
              TeamFlow AI understands the context behind every conversation — it remembers past tasks, 
              team member updates, and decisions — enabling smarter replies and fewer repeated questions.
            </p>
          </div>
          <div className="step-illustration">
              <img src={Product} alt="Product" />
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="feature-step">
          <div className="step-text">
            <p className="step-number">STEP 3</p>
            <h3 className="step-title">Task Assignments via Chat</h3>
            <p className="step-description">
              Simply tell TeamFlow what needs to be done. Our AI converts Slack messages into tasks, 
              assigns them, and tracks them across Notion or any PM tool. All without leaving your flow.
            </p>
          </div>
          <div className="step-illustration">
              <img src={OS} alt="OS" />
          </div>
        </RevealOnScroll>
      </RevealOnScroll>

      <RevealOnScroll id="pricing" className="section">
        <h2>Pricing Plans</h2>
        <div className="cards pricing-cards">
          <RevealOnScroll className="plan-card">
            <h3>Free Tier</h3>
            <p>Get started with AI-powered clarity—no cost.</p>
            <ul>
              <li>50 messages/mo</li>
              <li>Basic summaries</li>
            </ul>
            <button>Start Free</button>
          </RevealOnScroll>

          <RevealOnScroll className="plan-card popular">
            <h3>Pro Plan</h3>
            <p>The complete remote workspace toolkit.</p>
            <ul>
              <li>Unlimited messages</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
            <button className="glow">Join Pro</button>
          </RevealOnScroll>

          <RevealOnScroll className="plan-card">
            <h3>Enterprise</h3>
            <p>For large teams needing custom workflows and AI training.</p>
            <ul>
              <li>Dedicated AI tuning</li>
              <li>Admin controls</li>
            </ul>
            <button>Contact Sales</button>
          </RevealOnScroll>
        </div>
      </RevealOnScroll>

      <RevealOnScroll id="waitlist" className="section alt">
        <h2>GET EARLY ACCESS</h2>
        <p className="waitlist-desc">Be the first to transform your team's productivity. Join the waitlist and get exclusive perks.</p>
        <form className="waitlist-form" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Your email" required />
          <button className="waitlist-btn glow" type="submit">Join Waitlist</button>
        </form>
      </RevealOnScroll>

      <div className="footer-divider" />

      <footer className="footer">
        <div className="footer-content">
          <span className="trademark">&copy; {new Date().getFullYear()} Teamflow AI</span>
          <div className="footer-socials">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4 1.64a9.09 9.09 0 01-2.88 1.1A4.48 4.48 0 0016.11 0c-2.5 0-4.52 2.01-4.52 4.5 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.67 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.91 3.55 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 21.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.87 12.85-12.83 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z"/></svg>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3.64l.36-4H14V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
