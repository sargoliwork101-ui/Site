import React from 'react';
import { useData } from '../../context/DataContext';
import { ChipEmblem, useReveal } from '../theme/Icons';

/**
 * About / Resume page — ported from the site (website/views/about.php):
 * profile card + info card with CV download + bio + education & experience
 * timelines + skills.
 */
export const AboutPage = () => {
  const { data, setIsPdfModalOpen } = useData();
  const info = data?.personalInfo || {};
  const cfg = data?.siteConfig || {};
  const isFa = cfg.language === 'fa';

  const socials = [
    { label: 'GitHub', url: info.github },
    { label: 'LinkedIn', url: info.linkedin },
    { label: 'ORCID', url: info.orcid },
    { label: 'Scholar', url: info.scholar },
    { label: 'Telegram', url: info.telegram },
  ].filter((s) => s.url);

  const downloadCv = () => {
    if (cfg.cvPdfUrl) {
      window.open(cfg.cvPdfUrl, '_blank', 'noopener');
    } else {
      // Fallback: the app's built-in PDF resume generator
      setIsPdfModalOpen(true);
    }
  };

  useReveal([cfg.language]);

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="container">
          <h1>{isFa ? 'درباره من' : 'About Me'}</h1>
          <p className="page-sub">{isFa ? info.titleFa : info.titleEn}</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          {/* Sidebar: profile + contact info */}
          <aside className="about-side">
            <div className="card profile-card reveal">
              <div className="profile-emblem">
                <ChipEmblem />
              </div>
              <h3>{isFa ? info.fullNameFa : info.fullNameEn}</h3>
              <p className="role">{isFa ? info.titleFa : info.titleEn}</p>
            </div>

            <div className="info-card card reveal">
              <h3>{isFa ? 'اطلاعات تماس' : 'Contact Information'}</h3>
              <ul>
                {info.email && (
                  <li>
                    <span className="ico">✉️</span>
                    <bdi dir="ltr">{info.email}</bdi>
                  </li>
                )}
                {info.phone && (
                  <li>
                    <span className="ico">📞</span>
                    <bdi dir="ltr">{info.phone}</bdi>
                  </li>
                )}
                {(isFa ? info.locationFa : info.locationEn) && (
                  <li>
                    <span className="ico">📍</span>
                    {isFa ? info.locationFa : info.locationEn}
                  </li>
                )}
              </ul>
              <button className="btn btn-primary btn-block" onClick={downloadCv}>
                {isFa ? 'دانلود رزومه (PDF)' : 'Download Resume (PDF)'}
              </button>
              {socials.length > 0 && (
                <div className="socials">
                  {socials.map((s) => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="about-main">
            <h2 className="section-title reveal">{isFa ? 'خود معرفی' : 'About Me'}</h2>
            <div className="prose">
              <p>{isFa ? info.bioFa : info.bioEn}</p>
            </div>

            {/* Education timeline */}
            {(data?.education || []).length > 0 && (
              <>
                <h2 className="section-title mt reveal">{isFa ? 'تحصیلات' : 'Education'}</h2>
                <div className="timeline">
                  {data.education.map((ed) => (
                    <div className="tl-item" key={ed.id}>
                      <div className="tl-dot"></div>
                      <div className="tl-card card">
                        <div className="tl-head">
                          <h3>{isFa ? ed.degreeFa : ed.degreeEn}</h3>
                          {(isFa ? ed.yearFa : ed.yearEn) && (
                            <span className="tl-year">
                              <bdi dir="ltr">{isFa ? ed.yearFa : ed.yearEn}</bdi>
                            </span>
                          )}
                        </div>
                        <p className="tl-org">{isFa ? ed.universityFa : ed.universityEn}</p>
                        {(isFa ? ed.thesisFa : ed.thesisEn) && <p>{isFa ? ed.thesisFa : ed.thesisEn}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Experience timeline */}
            {(data?.experiences || []).length > 0 && (
              <>
                <h2 className="section-title mt reveal">{isFa ? 'سوابق کاری' : 'Work Experience'}</h2>
                <div className="timeline">
                  {[...data.experiences]
                    .sort((a, b) => String(b.sortDate || '').localeCompare(String(a.sortDate || '')))
                    .map((ex) => (
                      <div className="tl-item" key={ex.id}>
                        <div className="tl-dot"></div>
                        <div className="tl-card card">
                          <div className="tl-head">
                            <h3>{isFa ? ex.roleFa : ex.roleEn}</h3>
                            {(isFa ? ex.periodFa : ex.periodEn) && (
                              <span className="tl-year">
                                <bdi dir="ltr">{isFa ? ex.periodFa : ex.periodEn}</bdi>
                              </span>
                            )}
                          </div>
                          <p className="tl-org">
                            {isFa ? ex.companyFa : ex.companyEn}
                            {(isFa ? ex.locationFa : ex.locationEn) ? ` · ${isFa ? ex.locationFa : ex.locationEn}` : ''}
                          </p>
                          <p>{isFa ? ex.descriptionFa : ex.descriptionEn}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Skills (kept from the app: matrix with proficiency levels) */}
            {(data?.skills || []).length > 0 && (
              <>
                <h2 className="section-title mt reveal">{isFa ? 'مهارت‌ها و تخصص‌ها' : 'Skills & Expertise'}</h2>
                {data.skills.map((cat, ci) => (
                  <div className="card skill-cat reveal" key={ci}>
                    <h3>
                      <span
                        className="hf-chip-dot"
                        style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gradient)' }}
                      />
                      {isFa ? cat.categoryFa : cat.categoryEn}
                    </h3>
                    {(cat.items || []).map((sk, si) => (
                      <div className="skill-row" key={si}>
                        <div className="skill-row-head">
                          <span>{isFa ? sk.nameFa || sk.name : sk.nameEn || sk.name}</span>
                          <b>
                            {sk.level}% {sk.level >= 95 ? (isFa ? 'تسلط کامل' : 'Mastery') : sk.level >= 90 ? (isFa ? 'کارشناس' : 'Expert') : isFa ? 'خوب' : 'Proficient'}
                          </b>
                        </div>
                        <div className="skill-track">
                          <div className="skill-fill" style={{ width: `${sk.level || 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {/* Certifications (extra from the app) */}
            {(data?.certifications || []).length > 0 && (
              <>
                <h2 className="section-title mt reveal">{isFa ? 'گواهینامه‌ها' : 'Certifications'}</h2>
                <div className="timeline">
                  {data.certifications.map((c) => (
                    <div className="tl-item" key={c.id}>
                      <div className="tl-dot"></div>
                      <div className="tl-card card">
                        <div className="tl-head">
                          <h3>{isFa ? c.titleFa : c.titleEn}</h3>
                          {c.year && (
                            <span className="tl-year">
                              <bdi dir="ltr">{c.year}</bdi>
                            </span>
                          )}
                        </div>
                        <p className="tl-org">{isFa ? c.issuerFa || c.issuer : c.issuerEn || c.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
