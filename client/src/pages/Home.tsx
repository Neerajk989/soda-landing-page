import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Layers3,
  Lightbulb,
  Linkedin,
  LockKeyhole,
  MapPin,
  Menu,
  MessageSquare,
  Network,
  Phone,
  Rocket,
  Send,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

const logoUrl = "/manus-storage/sbjit-institute-logo_5c15d68c.png";

const tracks = [
  { id: "01", name: "Cloud foundations", copy: "Build fluent cloud vocabulary and practical confidence.", icon: Cloud },
  { id: "02", name: "Serverless & APIs", copy: "Move from idea to an accessible, deployable backend.", icon: Layers3 },
  { id: "03", name: "Data & AI", copy: "Explore responsible data projects with a builder mindset.", icon: Sparkles },
  { id: "04", name: "Security & architecture", copy: "Design resilient systems with clear technical choices.", icon: LockKeyhole },
];

const navItems = [
  ["About", "about"],
  ["Program", "program"],
  ["Members", "members"],
  ["Events", "events"],
  ["Connect", "connect"],
] as const;

type EventRecord = {
  id: number;
  slug: string;
  title: string;
  description: string;
  scheduleLabel: string;
  location: string;
  format: "in_person" | "online" | "hybrid";
  audience: string;
};

type MemberRecord = {
  id: number;
  fullName: string;
  position: string;
  team: string;
  sortOrder: number;
  active: number;
  branch: string | null;
  yearOfStudy: string | null;
  usn: string | null;
  linkedinUrl: string | null;
  contactNumber: string | null;
  hasProfileDetails: boolean;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const utils = trpc.useUtils();
  const eventsQuery = trpc.community.events.useQuery();
  const announcementsQuery = trpc.community.announcements.useQuery();
  const membersQuery = trpc.community.members.useQuery();
  const activityQuery = trpc.student.activity.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [eventDialog, setEventDialog] = useState<EventRecord | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [memberTeam, setMemberTeam] = useState("All teams");
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [requestedMemberSlug, setRequestedMemberSlug] = useState(() => new URLSearchParams(window.location.search).get("member"));
  const [application, setApplication] = useState({ branch: "", yearOfStudy: "", linkedinUrl: "", skills: "", motivation: "" });
  const [contact, setContact] = useState({ name: "", email: "", subject: "", message: "" });

  const registerMutation = trpc.student.register.useMutation({
    onSuccess: async result => {
      await utils.student.activity.invalidate();
      setEventDialog(null);
      toast.success(result.alreadyRegistered ? "You are already registered for this session." : "Your event registration has been saved.");
    },
    onError: error => toast.error(error.message || "Unable to save your registration."),
  });
  const applicationMutation = trpc.student.submitApplication.useMutation({
    onSuccess: async () => {
      await utils.student.activity.invalidate();
      setApplicationOpen(false);
      setApplication({ branch: "", yearOfStudy: "", linkedinUrl: "", skills: "", motivation: "" });
      toast.success("Your Student Builder Program interest form has been submitted.");
    },
    onError: error => toast.error(error.message || "Unable to submit your interest form."),
  });
  const contactMutation = trpc.community.contact.useMutation({
    onSuccess: () => {
      setContactOpen(false);
      setContact({ name: "", email: "", subject: "", message: "" });
      toast.success("Thanks — the community team will receive your enquiry.");
    },
    onError: error => toast.error(error.message || "Unable to send your enquiry."),
  });

  const openApplication = () => {
    if (!isAuthenticated) {
      toast.message("Sign in to submit your Student Builder Program interest form.");
      startLogin();
      return;
    }
    setApplicationOpen(true);
  };

  const openEvent = (event: EventRecord) => {
    if (!isAuthenticated) {
      toast.message("Sign in to register for community events.");
      startLogin();
      return;
    }
    setEventDialog(event);
  };

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applicationMutation.mutate(application);
  };

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    contactMutation.mutate(contact);
  };

  const closeMemberProfile = () => {
    setSelectedMember(null);
    setRequestedMemberSlug(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("member")) {
      url.searchParams.delete("member");
      window.history.replaceState({}, "", url);
    }
  };

  const events = (eventsQuery.data ?? []) as EventRecord[];
  const members = (membersQuery.data ?? []) as MemberRecord[];
  const memberTeams = ["All teams", ...Array.from(new Set(members.map(member => member.team)))];
  const visibleMembers = memberTeam === "All teams" ? members : members.filter(member => member.team === memberTeam);
  const announcements = Array.from(new Map((announcementsQuery.data ?? []).map(item => [item.title, item])).values());
  const firstName = user?.name?.split(" ")[0] || "Builder";

  useEffect(() => {
    if (!requestedMemberSlug || selectedMember || members.length === 0) return;
    const match = members.find(member => member.fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === requestedMemberSlug);
    if (match) setSelectedMember(match);
  }, [members, requestedMemberSlug, selectedMember]);

  return (
    <main className="community-shell">
      <div className="top-rule" />
      <header className="site-header">
        <button className="brand-lockup" onClick={() => scrollToSection("top")} type="button" aria-label="Go to top">
          <span className="brand-sign"><Cloud size={18} aria-hidden="true" /></span>
          <span><strong>AWS COMMUNITY</strong><small>S.B. JAIN INSTITUTE OF TECHNOLOGY</small></span>
        </button>
        <nav className={`desktop-nav ${mobileNavOpen ? "open" : ""}`} aria-label="Main navigation">
          {navItems.map(([label, id]) => <button type="button" onClick={() => { scrollToSection(id); setMobileNavOpen(false); }} key={id}>{label}</button>)}
        </nav>
        <div className="header-actions">
          {!loading && isAuthenticated ? (
            <button className="account-button" type="button" onClick={logout} title="Sign out"><span className="avatar-dot">{firstName.charAt(0)}</span><span className="account-name">{firstName}</span></button>
          ) : (
            <button className="text-button" type="button" onClick={startLogin}>Student sign in <ArrowUpRight size={15} /></button>
          )}
          <button className="mobile-menu" type="button" onClick={() => setMobileNavOpen(current => !current)} aria-label="Toggle navigation">{mobileNavOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content page-width">
          <div className="eyebrow"><span />STUDENT-LED · CLOUD-FOCUSED · CAMPUS-ROOTED</div>
          <div className="hero-copy">
            <h1>Build what’s<br /><em>next.</em></h1>
            <p>A student community for S.B. Jain learners who want to turn curiosity into cloud-ready projects, strong technical habits, and meaningful peer networks.</p>
          </div>
          <div className="hero-actions">
            <button className="primary-cta" type="button" onClick={openApplication}>Explore the Student Builder Program <ArrowRight size={18} /></button>
            <button className="secondary-cta" type="button" onClick={() => scrollToSection("events")}>See community sessions <ChevronRight size={18} /></button>
          </div>
          <div className="hero-footnote"><span>01</span><p>Learning happens in public — through questions, experiments, and projects worth sharing.</p></div>
        </div>
        <div className="hero-orbit" aria-hidden="true"><span className="orbit-core"><Network size={42} /></span><i /><b>cloud<br />network</b></div>
      </section>

      <section className="institution-strip" aria-label="Institution identity">
        <div className="page-width strip-content">
          <img src={logoUrl} alt="S.B. Jain Institute of Technology, Management and Research" />
          <p>Student community initiative for builders at S.B. Jain Institute of Technology, Management and Research, Nagpur.</p>
          <a href="https://www.sbjit.edu.in/" target="_blank" rel="noreferrer">Visit institute site <ExternalLink size={14} /></a>
        </div>
      </section>

      <section className="intro-section page-width" id="about">
        <div className="section-number">02 / ABOUT THE COMMUNITY</div>
        <div className="intro-layout">
          <h2>Less lecture.<br /><span>More launch.</span></h2>
          <div className="intro-detail"><p>We create a supportive place for students to learn cloud concepts, practise with peers, and grow the confidence to build useful technology. Start where you are, then keep showing up.</p><div className="three-values"><span><UsersRound size={18} />Peer learning</span><span><Code2 size={18} />Project practice</span><span><Lightbulb size={18} />Community sharing</span></div></div>
        </div>
      </section>

      <section className="track-section" id="program">
        <div className="page-width">
          <div className="section-heading"><div><span className="section-number">03 / STUDENT BUILDER PROGRAM</span><h2>A practical path<br />for <em>curious builders.</em></h2></div><button className="outline-button" type="button" onClick={openApplication}>Submit interest <ArrowUpRight size={16} /></button></div>
          <div className="track-grid">
            {tracks.map(track => { const Icon = track.icon; return <article className="track-card" key={track.id}><span className="track-id">{track.id}</span><Icon size={25} strokeWidth={1.6} /><h3>{track.name}</h3><p>{track.copy}</p><button type="button" onClick={openApplication}>I want to explore <ArrowRight size={15} /></button></article>; })}
          </div>
          <div className="program-note"><Rocket size={20} /><p><strong>How it works:</strong> Submit your interest, choose a starting track, and follow community updates as sessions and project opportunities are published.</p></div>
        </div>
      </section>

      <section className="members-section page-width" id="members">
        <div className="section-heading members-heading"><div><span className="section-number">04 / CORE MEMBERS</span><h2>Meet the people<br /><em>making it happen.</em></h2></div><div className="member-count"><UsersRound size={17} /><strong>{members.length || 20}</strong><span>core members</span></div></div>
        <p className="members-intro">The AWS Student Builder Group is organised around technical, design, operations, marketing, and event leadership. Browse the complete core roster by team.</p>
        <div className="member-filters" role="tablist" aria-label="Filter members by team">
          {memberTeams.map(team => <button type="button" key={team} onClick={() => setMemberTeam(team)} className={memberTeam === team ? "active" : ""} aria-pressed={memberTeam === team}>{team}</button>)}
        </div>
        <div className="member-grid">
          {membersQuery.isLoading && <div className="member-loading">Loading the core roster…</div>}
          {visibleMembers.map((member, index) => <button className={`member-card ${member.team === "Community Leadership" ? "leader-card" : ""}`} type="button" key={member.id || `${member.fullName}-${member.team}`} onClick={() => setSelectedMember(member)} aria-label={`View profile for ${member.fullName}`}><div className="member-card-top"><span>{String(index + 1).padStart(2, "0")}</span><UsersRound size={18} /></div><h3>{member.fullName}</h3><p>{member.position}</p><footer><span>{member.team}</span><span className="member-profile-link">View profile <ArrowUpRight size={12} /></span></footer></button>)}
        </div>
      </section>

      <section className="events-section page-width" id="events">
        <div className="section-heading"><div><span className="section-number">05 / COMMUNITY SESSIONS</span><h2>Find your<br /><em>next room.</em></h2></div><span className="events-status"><span />OPEN FOR STUDENT REGISTRATION</span></div>
        <div className="event-list">
          {eventsQuery.isLoading && <div className="event-loading">Loading community sessions…</div>}
          {events.map((event, index) => <article className="event-row" key={event.slug}><span className="event-index">0{index + 1}</span><div><span className="event-meta"><CalendarDays size={14} />{event.scheduleLabel}</span><h3>{event.title}</h3><p>{event.description}</p></div><div className="event-detail"><span><MapPin size={14} />{event.location}</span><span>{event.format.replace("_", " ")} · {event.audience}</span></div><button type="button" onClick={() => openEvent(event)}>Register <ArrowRight size={17} /></button></article>)}
        </div>
      </section>

      <section className="announcement-section">
        <div className="page-width announcement-layout">
          <div><span className="section-number">06 / NOTICEBOARD</span><h2>What’s<br /><em>moving.</em></h2></div>
          <div className="notice-list">{announcements.map(item => <article key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.body}</p><ArrowUpRight size={18} /></article>)}</div>
        </div>
      </section>

      {isAuthenticated && <section className="student-space page-width"><div><span className="section-number">YOUR COMMUNITY SPACE</span><h2>Welcome back,<br /><em>{firstName}.</em></h2></div><div className="student-activity"><div className="activity-stat"><span>Event registrations</span><strong>{activityQuery.data?.registrations.length ?? 0}</strong></div><div className="activity-stat"><span>Program interest</span><strong>{activityQuery.data?.application?.status ? activityQuery.data.application.status.replace("_", " ") : "Not submitted"}</strong></div><button className="secondary-cta" type="button" onClick={openApplication}>Update your interest <ArrowRight size={16} /></button></div></section>}

      <section className="connect-section" id="connect">
        <div className="page-width connect-grid"><div><span className="section-number">07 / CONNECT</span><h2>Let’s build a<br /><em>useful network.</em></h2><p>Have an idea for a session, collaboration, or campus project? Send the community team a note.</p></div><div className="connect-card"><MessageSquare size={25} /><h3>Start a conversation</h3><p>Share a question, propose a session, or ask how to get involved.</p><button className="primary-cta" type="button" onClick={() => setContactOpen(true)}>Send an enquiry <Send size={16} /></button></div></div>
      </section>

      <footer className="site-footer page-width"><div className="footer-brand"><span className="brand-sign"><Cloud size={17} /></span><div><strong>AWS COMMUNITY</strong><span>AT S.B. JAIN</span></div></div><p>Student-led community website. AWS and related marks belong to their respective owners. Institutional branding is used here for the community initiative and should be formally approved before public institutional use.</p><a href="mailto:info@sbjit.edu.in">info@sbjit.edu.in <ArrowUpRight size={14} /></a></footer>

      <Dialog open={Boolean(eventDialog)} onOpenChange={open => !open && setEventDialog(null)}>
        <DialogContent className="community-dialog"><DialogHeader><span className="dialog-label">EVENT REGISTRATION</span><DialogTitle>{eventDialog?.title}</DialogTitle><DialogDescription>{eventDialog?.scheduleLabel} · {eventDialog?.location}</DialogDescription></DialogHeader><div className="dialog-body"><CheckCircle2 size={21} /><p>Registering saves your interest to your student community profile. The community team will share final details through official channels.</p></div><button className="primary-cta dialog-action" type="button" onClick={() => eventDialog && registerMutation.mutate({ eventSlug: eventDialog.slug })} disabled={registerMutation.isPending}>{registerMutation.isPending ? "Saving registration…" : "Confirm registration"}<ArrowRight size={17} /></button></DialogContent>
      </Dialog>

      <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
        <DialogContent className="community-dialog form-dialog"><DialogHeader><span className="dialog-label">STUDENT BUILDER PROGRAM</span><DialogTitle>Tell us where you want to build.</DialogTitle><DialogDescription>This interest form helps the community team understand the learning tracks students want next.</DialogDescription></DialogHeader><form onSubmit={submitApplication} className="community-form"><div className="form-row"><label>Branch<input required value={application.branch} onChange={e => setApplication({ ...application, branch: e.target.value })} placeholder="e.g. Computer Science" /></label><label>Year of study<select required value={application.yearOfStudy} onChange={e => setApplication({ ...application, yearOfStudy: e.target.value })}><option value="">Choose year</option><option value="First year">First year</option><option value="Second year">Second year</option><option value="Third year">Third year</option><option value="Final year">Final year</option><option value="Postgraduate">Postgraduate</option></select></label></div><label>LinkedIn URL <span>(optional)</span><input value={application.linkedinUrl} onChange={e => setApplication({ ...application, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/…" /></label><label>What are you already exploring?<textarea required minLength={8} value={application.skills} onChange={e => setApplication({ ...application, skills: e.target.value })} placeholder="Skills, technologies, project ideas…" /></label><label>Why do you want to join this student builder community?<textarea required minLength={40} value={application.motivation} onChange={e => setApplication({ ...application, motivation: e.target.value })} placeholder="Share the kind of project or learning journey you want to pursue." /></label><button className="primary-cta dialog-action" type="submit" disabled={applicationMutation.isPending}>{applicationMutation.isPending ? "Submitting…" : "Submit interest"}<Send size={16} /></button></form></DialogContent>
      </Dialog>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="community-dialog form-dialog"><DialogHeader><span className="dialog-label">CONNECT WITH THE COMMUNITY</span><DialogTitle>Send an enquiry.</DialogTitle><DialogDescription>This form is for community ideas and general questions. For official institute enquiries, use the institute contact channels.</DialogDescription></DialogHeader><form onSubmit={submitContact} className="community-form"><div className="form-row"><label>Name<input required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder="Your name" /></label><label>Email<input required type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="name@example.com" /></label></div><label>Subject<input required value={contact.subject} onChange={e => setContact({ ...contact, subject: e.target.value })} placeholder="What would you like to discuss?" /></label><label>Message<textarea required minLength={20} value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} placeholder="Write your note here…" /></label><button className="primary-cta dialog-action" type="submit" disabled={contactMutation.isPending}>{contactMutation.isPending ? "Sending…" : "Send enquiry"}<Send size={16} /></button></form></DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedMember)} onOpenChange={open => !open && closeMemberProfile()}>
        <DialogContent className="community-dialog member-profile-dialog"><DialogHeader><span className="dialog-label">AWS COMMUNITY · MEMBER PROFILE</span><DialogTitle>{selectedMember?.fullName}</DialogTitle><DialogDescription>{selectedMember?.position} · {selectedMember?.team}</DialogDescription></DialogHeader><div className="profile-identity"><span className="profile-avatar"><UserRound size={24} /></span><div><strong>{selectedMember?.team}</strong><span>Core member</span></div></div><div className="member-profile-grid"><div className="profile-detail"><GraduationCap size={18} /><div><span>Branch</span><strong>{selectedMember?.branch || "Not publicly listed"}</strong></div></div><div className="profile-detail"><BookOpen size={18} /><div><span>Year</span><strong>{selectedMember?.yearOfStudy || "Not publicly listed"}</strong></div></div><div className="profile-detail"><LockKeyhole size={18} /><div><span>USN</span><strong>{selectedMember?.usn || "Not publicly listed"}</strong></div></div><div className="profile-detail"><Linkedin size={18} /><div><span>LinkedIn</span>{selectedMember?.linkedinUrl ? <a href={selectedMember.linkedinUrl} target="_blank" rel="noreferrer">View LinkedIn <ArrowUpRight size={12} /></a> : <strong>Not publicly listed</strong>}</div></div><div className="profile-detail profile-detail-wide"><Phone size={18} /><div><span>Contact number</span><strong>{selectedMember?.contactNumber || "Not publicly listed"}</strong></div></div></div><p className="profile-privacy"><LockKeyhole size={14} />Academic details, USN, LinkedIn, and contact information appear only after the named member has authorised public display.</p></DialogContent>
      </Dialog>
    </main>
  );
}
