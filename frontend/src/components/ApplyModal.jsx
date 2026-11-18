import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Sparkles,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Send,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import './ApplyModal.css';

export function ApplyModal({
  isOpen,
  onClose,
  initialPlanId
}) {
  const { plans, web3formsKey } = usePlans(isOpen);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || "cohort-24h");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(null);
  
  // Student pre-registration form state (empty by default so inputs are not pre-filled)
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentGrade, setStudentGrade] = useState("Grade 8");

  // Reset application state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setApplicationSuccess(null);
      setErrorMsg(null);
      if (initialPlanId) setSelectedPlanId(initialPlanId);
    }
  }, [isOpen, initialPlanId]);

  if (!isOpen) return null;

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  // Direct WhatsApp Inquiry
  const handleOpenWhatsApp = () => {
    const text = `Hi Kreomax Admissions! I am interested in enrolling for the *${selectedPlan.name}* (${selectedPlan.duration}). Please share the upcoming batch start date, schedule and fee details. My Name: ${studentName || 'Student'}, Phone: ${studentPhone || 'N/A'}`;
    const url = `https://wa.me/918310590859?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Submit Pre-Registration Application
  const handleSubmitApplication = async (e) => {
    if (e) e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim()) {
      setErrorMsg("Please enter your name and contact phone number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const resp = await fetch('/api/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim(),
          studentPhone: studentPhone.trim(),
          studentGrade: studentGrade
        })
      });

      const data = await resp.json();
      setLoading(false);

      if (data.status === 'success') {
        setApplicationSuccess({
          applicationId: data.applicationId,
          planName: selectedPlan.name,
          duration: selectedPlan.duration,
          phone: studentPhone,
          whatsappUrl: data.whatsappUrl
        });
        localStorage.setItem('kmx_application_id', data.applicationId);
        localStorage.setItem('kmx_applied_plan', selectedPlan.id);

        // ── Direct Client-Side Web3Forms Notification (Bypasses all server IP & datacenter blocks) ──
        if (web3formsKey) {
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: web3formsKey,
              subject: `🎓 New Kreomax Lead: ${studentName.trim()} – ${selectedPlan.name}`,
              from_name: 'Kreomax Admissions',
              name: studentName.trim(),
              phone: studentPhone.trim(),
              email: studentEmail.trim() || 'kreomax9@gmail.com',
              grade: studentGrade,
              plan: selectedPlan.name,
              applicationId: data.applicationId,
              message: `New Admission Application Received:\n\n• Student: ${studentName.trim()}\n• Phone: ${studentPhone.trim()}\n• Email: ${studentEmail.trim() || 'Not provided'}\n• Grade: ${studentGrade}\n• Plan: ${selectedPlan.name}\n• Application ID: ${data.applicationId}`
            })
          }).catch(err => console.log('[Client-side Web3Forms Notice]:', err));
        }
      } else {
        throw new Error(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to submit application. Please try again.');
    }
  };

  const handleClose = () => {
    setApplicationSuccess(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="km-pay-overlay" onClick={handleClose}>
      <div className="km-pay-modal" onClick={e => e.stopPropagation()}>
        <button className="km-pay-close-btn" onClick={handleClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Application Submitted Success View */}
        {applicationSuccess ? (
          <div className="km-pay-success">
            <div className="km-pay-success-icon">
              <CheckCircle2 size={46} />
            </div>

            <div className="km-app-id-pill">
              Application ID: <strong>{applicationSuccess.applicationId}</strong>
            </div>

            <h2 className="km-pay-success-title">Application Submitted Successfully!</h2>
            
            <p className="km-pay-success-sub">
              Thank you for applying to the <strong>{applicationSuccess.planName}</strong> ({applicationSuccess.duration}).
            </p>

            <div className="km-pay-notice-card">
              <div className="km-notice-icon">💬</div>
              <div className="km-notice-content">
                <strong>What happens next?</strong>
                <p>
                  Our admissions counselor will contact you via WhatsApp / Call at <strong>{applicationSuccess.phone}</strong> within 24 hours to confirm your batch timings, orientation schedule and fee details.
                </p>
              </div>
            </div>

            <div className="km-success-action-row">
              <a
                href={applicationSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="km-wa-direct-btn"
              >
                <MessageCircle size={18} /> Chat with Admissions on WhatsApp
              </a>
              <button type="button" className="km-done-close-btn" onClick={handleClose}>
                Done / Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="km-pay-header">
              <div className="km-pay-badge">
                <Sparkles size={13} />
                <span>Applications open</span>
              </div>
              <h2 className="km-pay-title">
                Choose Your <span className="klp-gradient-text">Creator Pathway</span>
              </h2>
              <p className="km-pay-subtitle">
                Master all 6 levels of multimodal AI creation, build real-world deliverables, and launch your certified creative portfolio.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="km-pay-error">
                {errorMsg}
              </div>
            )}

            {/* Plan Cards Grid (2 Options) */}
            <div className="km-pay-plans-grid">
              {plans.map(plan => {
                const IconComponent = plan.icon || Users;
                const isSelected = selectedPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`km-pay-card ${isSelected ? 'km-pay-card--selected' : ''} ${plan.popular ? 'km-pay-card--popular' : ''}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                    style={{ '--plan-accent': plan.accentColor }}
                  >
                    {plan.popular && (
                      <div className="km-pay-card-pop-tag">
                        ★ {plan.badge}
                      </div>
                    )}

                    <div className="km-pay-card-header">
                      <div className="km-pay-card-icon-box">
                        <IconComponent size={22} />
                      </div>
                      <div>
                        <div className="km-pay-card-name">{plan.name}</div>
                        <div className="km-pay-card-duration">
                          <Clock size={12} /> {plan.duration}
                        </div>
                      </div>
                    </div>

                    <div className="km-pay-card-schedule">
                      <Calendar size={13} />
                      <span>{plan.schedule}</span>
                    </div>

                    <p className="km-pay-card-desc">{plan.tagline}</p>

                    <div className="km-pay-deliverables-pill">
                      <span>🎯</span> {plan.deliverables}
                    </div>

                    <div className="km-pay-card-features">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="km-feature-item">
                          <div className="km-feature-check">
                            <Check size={12} />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="km-pay-card-select-indicator">
                      {isSelected ? (
                        <span className="km-selected-label">✓ Selected Track</span>
                      ) : (
                        <span className="km-unselected-label">Click to Select</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Student Pre-Registration Form & Actions */}
            <form className="km-pay-checkout-section" onSubmit={handleSubmitApplication}>
              <div className="km-pay-inputs-row">
                <div className="km-input-group">
                  <label>Student / Parent Full Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="km-input-group">
                  <label>WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={e => setStudentPhone(e.target.value)}
                    placeholder="Enter WhatsApp / mobile number"
                  />
                </div>
                <div className="km-input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    placeholder="Enter email address (optional)"
                  />
                </div>
                <div className="km-input-group">
                  <label>Grade / Class</label>
                  <select
                    value={studentGrade}
                    onChange={e => setStudentGrade(e.target.value)}
                    className="km-select"
                  >
                    <option value="Grade 6-7">Grade 6 - 7 (Ages 11-12)</option>
                    <option value="Grade 8">Grade 8 (Age 13)</option>
                    <option value="Grade 9">Grade 9 (Age 14)</option>
                    <option value="Grade 10">Grade 10 (Age 15)</option>
                    <option value="Grade 11-12">Grade 11 - 12 (Ages 16-18)</option>
                    <option value="College / Enthusiast">College / Adult Creator</option>
                  </select>
                </div>
              </div>

              <div className="km-pay-action-bar">
                <div className="km-pay-summary">
                  <span className="km-summary-label">Selected Track:</span>
                  <span className="km-summary-name">{selectedPlan.name}</span>
                </div>

                <div className="km-pay-btn-group">
                  <button
                    type="button"
                    className="km-pay-wa-btn"
                    onClick={handleOpenWhatsApp}
                    title="Chat directly on WhatsApp"
                  >
                    <MessageCircle size={16} /> Inquire via WhatsApp
                  </button>

                  <button
                    type="submit"
                    className="km-pay-checkout-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="km-spinner">Sending...</span>
                    ) : (
                      <>
                        <Send size={15} />
                        Apply for {selectedPlan.name}
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ApplyModal;
