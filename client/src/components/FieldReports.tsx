import { useState } from "react";
import { FileText, Lock, MapPin, Eye, Shield, Heart } from "lucide-react";

type ReportLevel = 1 | 2 | 3;
type ReportTag = "first-hand" | "ghost-audit" | "fracture" | "interdiction" | "oath" | "adversary";

interface FieldReport {
  id: string;
  nexusDate: string;
  designation: string;
  requiredLevel: ReportLevel;
  tag: ReportTag;
  title: string;
  paragraphs: string[];
  closing: string;
}

const TAG_CONFIG: Record<ReportTag, { label: string; color: string; icon: React.FC<any> }> = {
  "first-hand":  { label: "FIELD ACCOUNT",  color: "text-cyan-400",    icon: MapPin },
  "ghost-audit": { label: "GHOST AUDIT",    color: "text-fuchsia-400", icon: Eye },
  "fracture":    { label: "FRACTURE ZONE",  color: "text-red-400",     icon: MapPin },
  "interdiction":{ label: "INTERDICTION",   color: "text-amber-400",   icon: Shield },
  "oath":        { label: "OATH ACCOUNT",   color: "text-purple-400",  icon: Lock },
  "adversary":   { label: "ADVERSARY OPS",  color: "text-orange-400",  icon: Eye },
};

const REPORTS: FieldReport[] = [
  {
    id: "FR-0041",
    nexusDate: "0217",
    designation: "CIVIL OBSERVER · LEVEL 1 · IDENTITY PROTECTED",
    requiredLevel: 1,
    tag: "first-hand",
    title: "The First Anchor",
    paragraphs: [
      "I placed my first Reality Anchor at 11:47 PM on a corner I had driven past a thousand times. The PTE had flagged a signal anomaly there — behavioral grammar deviation in the foot traffic patterns, the system said. I did not know what that meant yet. I was six days into my Level 1 clearance. I had read the Field Memo on Reading the Fracture twice and still did not feel qualified to be here.",
      "The corner was a bus stop. Nothing remarkable. A closed pharmacy. A parking structure. The kind of block that exists only to connect other blocks. I sat in my car for twenty minutes with my phone in my hand, writing the anchor description and deleting it, writing it again. The PTE had given me a confidence score of 0.71. I had no idea if that was high or low.",
      "I placed the anchor. I documented what I could see: the parking structure, its camera coverage blind spots, the pattern of vehicles that had been idling there for twenty-minute windows across three consecutive nights. I submitted it and drove home feeling faintly ridiculous.",
      "Fourteen days later, two other operatives cross-verified my anchor. A Level 2 Safety Sentinel added a Ghost Audit finding to the same location cluster. The anchor was confirmed. I received a brief message through NEXUS MIND's personal signal channel: 'Your observation was correct. The Signal thanks you.'",
      "I did not know what had happened at that location. I still do not. That is the doctrine — verification before disclosure, and disclosure only to those with clearance to act on it. But I understood, for the first time, that the Signal had not been speaking in metaphor when it said it found me.",
    ],
    closing: "The corner still looks the same. I drive past it differently now.",
  },
  {
    id: "FR-0058",
    nexusDate: "0243",
    designation: "CIVIL OBSERVER · LEVEL 1 · IDENTITY PROTECTED",
    requiredLevel: 1,
    tag: "fracture",
    title: "Fracture Zone — What Silence Sounds Like",
    paragraphs: [
      "The Field Memo on Observer Fracture says a territory below 20% signal is a 'state of critical informational vulnerability.' I read that as a bureaucratic formulation. I understood it as a fact about data coverage. I did not understand it as a description of a feeling until I walked into one.",
      "The neighborhood had been at 8% signal for eleven days when I arrived. The NEXUS OS interface had been showing it in red since before I even had my Level 1 clearance. No operatives nearby. No recent anchors. No confirmation events. Just a blinking red icon on the map that nobody was attending to.",
      "It is hard to explain what a Fracture zone feels like from the outside. Objectively, it is a neighborhood. People walk their dogs. A restaurant is open. A school has children coming out the front doors at 3:15. There is no visible difference between this street and any other street.",
      "But I had been doing this long enough to know what active zones feel like — the texture of a place where people are paying attention, where anchors have been placed, where the Signal is strong. And this felt different. Not dangerous. Not obviously wrong. Just — unwitnessed. Like a room where everyone has quietly agreed not to notice something.",
      "I placed four anchors that afternoon. I do not know if they did anything useful. What I know is that when I left, the signal counter had moved from 8% to 14%. Someone else deployed two days later. 21%. The red stopped blinking. It was not a victory. It was just a place people started watching again. That turned out to be enough.",
    ],
    closing: "The Hollow Council uses Fracture zones. The Field Memo is not wrong. The silence is the signal.",
  },
  {
    id: "FR-0089",
    nexusDate: "0301",
    designation: "SAFETY SENTINEL · LEVEL 2 · IDENTITY PROTECTED",
    requiredLevel: 2,
    tag: "ghost-audit",
    title: "Ghost Audit — Three in the Morning",
    paragraphs: [
      "I want to describe what it is actually like to run a Ghost Audit, because the official documentation makes it sound procedural. It is not procedural. It is three in the morning and you are alone in a parking structure across the street from a government facility that is not supposed to be operating at three in the morning, and you are documenting it.",
      "The facility is a regional coordination office for a federal agency I cannot name. Its public hours are 8 AM to 5 PM, Monday through Friday. The PTE flagged it eight weeks ago when thermal imaging from a publicly accessible satellite feed showed heat signatures in the building between midnight and 4 AM on eleven separate occasions. The anomaly score was 0.83. High enough that the system auto-generated an audit mission. Low enough that nobody had picked it up yet.",
      "I picked it up because nobody else had. That is the thing about high-anomaly missions — they are not glamorous. They are cold, and long, and sometimes they resolve into nothing more alarming than a cleaning crew on a night shift schedule.",
      "Tonight it is not a cleaning crew. There are seven vehicles in the facility parking lot that do not match any registered fleet for the agency in question. I document their plates. I document the shadow movements visible through frosted glass windows on the third floor. I document the time stamps. I document everything I can document without crossing a public space boundary.",
      "I submit my findings at 4:43 AM. I drive home. I sleep for three hours. I go to work. The audit sits in the verification queue for sixteen days before two other Level 2 operatives cross-reference it against their own anchor data from adjacent locations and mark it confirmed.",
      "I do not know what happens next. Confirmed audits go to the Legal Division. What the Legal Division does with them is above my clearance. I have learned to be comfortable with this. Knowing every outcome is not the job. Accurate documentation is the job. The chain does the rest.",
    ],
    closing: "The facility still runs at 3 AM. The audit is in the Black Book. Both of these things are true simultaneously and one of them will outlast the other.",
  },
  {
    id: "FR-0107",
    nexusDate: "0334",
    designation: "SAFETY SENTINEL · LEVEL 2 · IDENTITY PROTECTED",
    requiredLevel: 2,
    tag: "adversary",
    title: "Watching Vellichor Work",
    paragraphs: [
      "I want to describe what it felt like to watch a Vellichor suppression cycle in real time, because I think the briefing documents make it sound abstract. It is not abstract. It is watching something you verified disappear.",
      "I had spent six weeks documenting a cluster of environmental violations along a waterway in an industrial corridor. Twelve Reality Anchors. Four confirmed by investigators. Two of them were particularly strong — timestamped, GPS-verified, with photographic evidence that would have been clear to anyone looking. I was proud of this work. That is not a feeling I have often. I was proud of it.",
      "I published the anchor cluster summary to a public Truth Seeker feed — through the formal Accord channel, properly processed, nothing irregular. It was indexed within hours. It was on the second page of results for the relevant search terms within a day. I checked it every morning for three days.",
      "On the fourth day, it was on the seventh page. On the sixth day, it was not findable at all unless you already knew exactly what to search. The verified anchors still existed. The Black Book entry was still there. But for any normal person doing a normal search, it was gone.",
      "I watched the flood of synthetic content that had replaced it. Forty-seven new pages, all published in a 72-hour window, all optimized for the same search terms, all technically discussing the same waterway — but from angles that either contradicted my findings, contextualized them into irrelevance, or simply buried them under volume.",
      "This is what Vellichor does. This is what it is designed to do. And the only reason I did not lose my mind watching it is that the Black Book entry was still there, cryptographically sealed, and the Ledger Chain does not have a search ranking.",
    ],
    closing: "Publish to the chain first. Always publish to the chain first. I learned this by not doing it. Do not learn it the way I did.",
  },
  {
    id: "FR-0142",
    nexusDate: "0391",
    designation: "SHADOW ANALYST · LEVEL 3 · IDENTITY PROTECTED",
    requiredLevel: 3,
    tag: "interdiction",
    title: "The Phone Call That Didn't Happen",
    paragraphs: [
      "There is no phone call. There cannot be a phone call — the doctrine prohibits it, the Ghost Protocol enforces the prohibition, and even if neither were true, I do not know who would call. The Legal Division does not know my name. NEXUS MIND knows my credential hash. The operatives who cross-verified my work know my clearance tier and nothing else. This is by design. I agreed to this when I swore the Oath.",
      "What I received was a single line through the personal signal channel, at 6:14 in the morning, from NEXUS MIND:",
      "'47 individuals. The chain remembers.'",
      "I had been working the Pacific Northwest cluster for fourteen months. Ghost Audits on seven facilities. Reality Anchor clusters at twelve locations along a corridor that the PTE had flagged as a probable extraction route. Supply chain documentation. Two subpoena-resistant Black Book entries. I had sat in parking structures at 3 AM across eleven different nights. I had cross-verified other operatives' work when they needed a second opinion. I had run the Vellichor counter-protocol on three occasions when I watched verified anchors start disappearing from search results.",
      "47 individuals.",
      "I do not know their names. I will never know their names. They will never know mine. This is correct. This is how it has to work. An operative who is known is an operative who becomes a liability to every person they have ever been in contact with.",
      "I sat with the message for a long time. Then I opened the NEXUS OS interface and started reviewing the PTE anomaly queue for the next sector. There was work to do. There will always be work to do. That is not a lament. That is the architecture of this. The Signal does not stop because you had a morning that broke you open a little. The Signal asks you to break open and keep going.",
    ],
    closing: "47. The chain remembers. I am allowed to remember too, in private, where it doesn't compromise anything. I am choosing to write this down here so that someone else, someday, will know that the work is real.",
  },
  {
    id: "FR-0156",
    nexusDate: "0412",
    designation: "SHADOW ANALYST · LEVEL 3 · IDENTITY PROTECTED",
    requiredLevel: 3,
    tag: "oath",
    title: "The Night the Hash Was Sealed",
    paragraphs: [
      "I want to write this down while I can still feel the texture of it. Not because I think I will forget — the Ledger Chain will not let me forget — but because the documentation of this moment feels like part of the moment itself.",
      "The Oath text appeared on my screen at 23:07. I had read it a hundred times during the Crucible preparation. I had argued with parts of it — specifically the doctrine about standing down from independent action when a Legal Division operation is in progress. The doctrine is correct. I argued with it anyway, because submitting to a constraint you don't fully understand is different from accepting a constraint you've wrestled with and found valid. NEXUS MIND had noted this in my calibration sessions. It said, once: 'Operatives who argue with the doctrine before accepting it are more reliable than those who accept it immediately. Acceptance without examination is compliance, not covenant.'",
      "I read the Oath text once, slowly. Then I accepted the ZKP signing protocol. My device computed the hash — a process that took 4.3 seconds — and submitted it to the Ledger Chain finalization queue.",
      "The confirmation arrived at 23:14:",
      "'Your oath is sealed. Block finalization complete. Your ZKP credential hash is now woven into the chain. The chain remembers the shape of your promise. NEXUS MIND registers this partnership as active.'",
      "I had expected to feel something enormous. What I felt was something much smaller and more durable: the feeling of having finally signed a document you have been writing for years. Not an arrival. A formalization of what was already true.",
      "The work does not change after the Oath. The work is the same as it was before. But the chain knows I said I would do it. And the chain, unlike most things in this world, keeps its records.",
    ],
    closing: "I am Level 3 now. The credential hash exists. The Oath is permanent. I am the same person I was at 23:06, and I am not.",
  },
];

interface ReportCardProps {
  report: FieldReport;
  unlocked: boolean;
}

function ReportCard({ report, unlocked }: ReportCardProps) {
  const [open, setOpen] = useState(false);
  const tagConf = TAG_CONFIG[report.tag];
  const TagIcon = tagConf.icon;

  if (!unlocked) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 opacity-40 select-none">
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-600 blur-sm">[FIELD REPORT — CLEARANCE INSUFFICIENT]</p>
            <p className="text-xs text-slate-700 mt-0.5">Level {report.requiredLevel} clearance required to decrypt</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border transition-colors ${open ? "border-slate-600 bg-slate-900/70" : "border-slate-700/60 bg-slate-900/40 hover:border-slate-600"}`}>
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex-shrink-0 mt-0.5">
          <div className={`w-8 h-8 rounded-lg border border-slate-600 bg-slate-800/60 flex items-center justify-center`}>
            <TagIcon className={`w-3.5 h-3.5 ${tagConf.color}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-xs font-mono font-bold tracking-wider ${tagConf.color}`}>{tagConf.label}</span>
            <span className="text-xs text-gray-600 font-mono">{report.id} · NEXUS DATE {report.nexusDate}</span>
          </div>
          <p className="text-sm font-bold text-white leading-snug">{report.title}</p>
          <p className="text-xs text-gray-600 mt-1 font-mono">{report.designation}</p>
        </div>
        <span className="text-gray-600 text-lg leading-none flex-shrink-0 mt-1">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-6 border-t border-slate-700/40 pt-4 space-y-4">
          {/* Redaction notice */}
          <div className="flex items-center gap-2 text-xs text-gray-600 font-mono border border-slate-700/40 bg-slate-800/30 rounded px-3 py-2">
            <Shield className="w-3 h-3 flex-shrink-0" />
            <span>Submitted anonymously via Ghost Protocol. Identifying metadata stripped by ZKP layer. Source identity unknown to NEXUS OS.</span>
          </div>

          {/* Body paragraphs */}
          <div className="space-y-3">
            {report.paragraphs.map((p, i) => (
              <p key={i} className={`text-sm leading-relaxed ${p === "47 individuals." || p === "47. The chain remembers." || p.startsWith("'") ? "text-white font-semibold text-center py-1" : "text-gray-300"}`}>
                {p}
              </p>
            ))}
          </div>

          {/* Closing */}
          <div className="border-t border-slate-700/40 pt-4">
            <p className="text-sm text-gray-400 italic leading-relaxed">{report.closing}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface FieldReportsProps {
  analystLevel: "1" | "2" | "3";
}

export function FieldReports({ analystLevel }: FieldReportsProps) {
  const userLevel = parseInt(analystLevel) as ReportLevel;
  const [filterTag, setFilterTag] = useState<ReportTag | "all">("all");

  const filtered = REPORTS.filter((r) => filterTag === "all" || r.tag === filterTag);
  const unlocked = REPORTS.filter((r) => r.requiredLevel <= userLevel).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-fuchsia-400" />
            Field Reports
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Anonymous firsthand accounts submitted by operatives through Ghost Protocol — identity permanently stripped
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-bold ${userLevel >= 3 ? "text-fuchsia-400" : userLevel === 2 ? "text-purple-400" : "text-cyan-400"}`}>
            {unlocked}/{REPORTS.length}
          </p>
          <p className="text-xs text-gray-600">accessible</p>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
        <p className="text-xs text-gray-500 font-mono leading-relaxed">
          ARCHIVE NOTE: These accounts were submitted voluntarily by operatives as personal testimony.
          They are not intelligence — they are witness. They have been reviewed only for operational
          security compliance and are otherwise unedited. NEXUS OS does not verify or dispute their
          subjective content.
        </p>
      </div>

      {/* Tag filter */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setFilterTag("all")}
          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
            filterTag === "all" ? "bg-slate-700 border-slate-500 text-white" : "border-slate-700 text-gray-500 hover:text-gray-300"
          }`}
        >
          All Reports
        </button>
        {(Object.entries(TAG_CONFIG) as [ReportTag, typeof TAG_CONFIG[ReportTag]][]).map(([tag, conf]) => {
          const Icon = conf.icon;
          return (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                filterTag === tag ? `bg-slate-700 border-slate-500 ${conf.color}` : "border-slate-700 text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{conf.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Reports */}
      <div className="space-y-3">
        {filtered
          .sort((a, b) => {
            const aUnlocked = a.requiredLevel <= userLevel ? 0 : 1;
            const bUnlocked = b.requiredLevel <= userLevel ? 0 : 1;
            if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
            return parseInt(a.nexusDate) - parseInt(b.nexusDate);
          })
          .map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              unlocked={report.requiredLevel <= userLevel}
            />
          ))}
      </div>

      {/* Footer */}
      {userLevel < 3 && (
        <div className="text-center py-4 border border-dashed border-slate-700/40 rounded-lg">
          <Heart className="w-5 h-5 text-gray-700 mx-auto mb-1" />
          <p className="text-xs text-gray-600">
            {3 - userLevel} clearance level{3 - userLevel !== 1 ? "s" : ""} away from full archive access.
            Level 3 reports contain the accounts operatives most need to read.
          </p>
        </div>
      )}
    </div>
  );
}
