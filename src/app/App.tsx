import { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, Building2, Bell, FileText, User, LogOut,
  Search, Download, ChevronDown, ChevronRight, ChevronLeft,
  Clock, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowUpRight,
  Plus, Eye, Edit2, MoreHorizontal, Calendar, TrendingUp, TrendingDown,
  Shield, X, Lock, Mail, ChevronUp,
  CreditCard, Briefcase, FileCheck, AlertCircle,
  BarChart3, History, Smartphone, CheckCheck, FileDown, Printer,
  UserCheck, Zap, BookOpen, Inbox,
  CircleDot, Info, Monitor, Archive, Save, UserPlus, ClipboardList, ShieldAlert, Wallet, Settings, Menu,
} from "lucide-react";
import logo from "../imports/image.png";

// ─── Types ──────────────────────────────────────────────────────────────────
type View = "dashboard" | "units" | "unit-detail" | "processes" | "notifications" | "reports" | "acting-history" | "profile" | "history";
type Status = "Em andamento" | "Novo" | "Pago" | "Concluído" | "Pendente" | "Cancelado" | "Aguardando ação" | "Encerrado";
type LoginStep = "credentials" | "mfa";

interface Unit {
  id: string; unit: string; building: string; condo: string;
  owner: string; cpf: string; phone: string; email: string;
  status: Status; process: string; value: number; debt: number;
  since: string; nextDue?: string; city: string;
  honorarios?: number; endedAt?: string;
}
interface IncomingProcess {
  id: string; unit: string; building: string; condo: string; city: string;
  owner: string; cpf: string; phone: string; email: string;
  process: string; value: number; debt: number; assignedAt: string;
}
interface Notif {
  id: number; type: string; title: string; desc: string; time: string; read: boolean;
}
interface TimelineEvent {
  id: number; date: string; time: string; user: string; type: string; desc: string; category: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const SEED_UNITS: Unit[] = [
  { id: "U001", unit: "Apto 42", building: "Ed. Residencial Parque das Flores", condo: "Res. Parque das Flores", owner: "Carlos Eduardo Mendes", cpf: "***.***.234-56", phone: "(11) 9****-8734", email: "c.mendes@email.com", status: "Em andamento", process: "PRC-2024-0842", value: 4850, debt: 14250, since: "15/03/2024", nextDue: "30/01/2025", city: "São Paulo" },
  { id: "U002", unit: "Apto 87", building: "Cond. Solar das Palmeiras", condo: "Solar das Palmeiras", owner: "Ana Paula Ferreira", cpf: "***.***.891-23", phone: "(11) 9****-2345", email: "anapaula@email.com", status: "Aguardando ação", process: "PRC-2024-1103", value: 2900, debt: 8700, since: "01/06/2024", nextDue: "25/01/2025", city: "São Paulo" },
  { id: "U003", unit: "Casa 15", building: "Cond. Verde Ville", condo: "Verde Ville", owner: "Roberto Alves da Silva", cpf: "***.***.445-78", phone: "(11) 9****-6789", email: "roberto.silva@email.com", status: "Novo", process: "PRC-2025-0021", value: 6200, debt: 6200, since: "10/01/2025", nextDue: "10/02/2025", city: "Guarulhos" },
  { id: "U004", unit: "Apto 203", building: "Ed. Monte Carlo", condo: "Monte Carlo", owner: "Fernanda Costa Lima", cpf: "***.***.672-90", phone: "(11) 9****-4321", email: "fernanda.lima@email.com", status: "Pendente", process: "PRC-2024-0765", value: 3450, debt: 10350, since: "20/02/2024", nextDue: "28/01/2025", city: "São Paulo" },
  { id: "U005", unit: "Sala 05", building: "Ed. Comercial Center", condo: "Comercial Center", owner: "Marcos Tulio Barbosa", cpf: "***.***.118-34", phone: "(11) 9****-9012", email: "m.barbosa@empresa.com", status: "Pago", process: "PRC-2024-0901", value: 8100, debt: 0, since: "10/04/2024", city: "São Bernardo" },
  { id: "U006", unit: "Apto 118", building: "Res. Vista Verde", condo: "Vista Verde", owner: "Luciana Martins Campos", cpf: "***.***.334-67", phone: "(11) 9****-5678", email: "luciana.campos@email.com", status: "Em andamento", process: "PRC-2024-0677", value: 3200, debt: 9600, since: "05/01/2024", nextDue: "05/02/2025", city: "São Paulo" },
  { id: "U007", unit: "Cobertura 01", building: "Ed. Terraço Nobre", condo: "Terraço Nobre", owner: "Paulo Henrique Souza", cpf: "***.***.782-12", phone: "(11) 9****-3456", email: "ph.souza@email.com", status: "Encerrado", process: "PRC-2023-1456", value: 12500, debt: 0, since: "15/08/2023", city: "São Paulo", honorarios: 2500, endedAt: "14/01/2025" },
  { id: "U008", unit: "Apto 31", building: "Cond. Jardim Europa", condo: "Jardim Europa", owner: "Juliana Ramos Pereira", cpf: "***.***.209-45", phone: "(11) 9****-7890", email: "juliana.pereira@email.com", status: "Em andamento", process: "PRC-2024-1245", value: 2750, debt: 5500, since: "12/09/2024", nextDue: "31/01/2025", city: "Osasco" },
  { id: "U009", unit: "Loja 08", building: "Shopping Galeria Norte", condo: "Galeria Norte", owner: "André Santos Oliveira", cpf: "***.***.556-89", phone: "(11) 9****-2109", email: "a.oliveira@lojas.com", status: "Cancelado", process: "PRC-2024-0334", value: 5600, debt: 0, since: "20/01/2024", city: "São Paulo", honorarios: 0, endedAt: "02/09/2024" },
  { id: "U010", unit: "Apto 65", building: "Ed. Bela Vista", condo: "Bela Vista", owner: "Camila Ribeiro Torres", cpf: "***.***.423-01", phone: "(11) 9****-6543", email: "camila.torres@email.com", status: "Aguardando ação", process: "PRC-2025-0008", value: 3900, debt: 3900, since: "05/01/2025", nextDue: "26/01/2025", city: "São Paulo" },
  { id: "U011", unit: "Casa 07", building: "Cond. Bosque Sereno", condo: "Bosque Sereno", owner: "Rodrigo Lima Figueiredo", cpf: "***.***.887-23", phone: "(11) 9****-8901", email: "rodrigo.fig@email.com", status: "Em andamento", process: "PRC-2024-1089", value: 7200, debt: 21600, since: "22/07/2024", nextDue: "22/02/2025", city: "Cotia" },
  { id: "U012", unit: "Apto 149", building: "Res. Primavera", condo: "Res. Primavera", owner: "Patrícia Mendonça Gomes", cpf: "***.***.341-56", phone: "(11) 9****-4567", email: "patricia.gomes@email.com", status: "Novo", process: "PRC-2025-0019", value: 3100, debt: 3100, since: "08/01/2025", nextDue: "08/02/2025", city: "São Paulo" },
  { id: "U013", unit: "Apto 22", building: "Ed. Vintage Palace", condo: "Vintage Palace", owner: "Sérgio Andrade Costa", cpf: "***.***.754-78", phone: "(11) 9****-1234", email: "sergio.costa@email.com", status: "Concluído", process: "PRC-2023-0987", value: 4500, debt: 0, since: "01/11/2023", city: "São Paulo", honorarios: 900, endedAt: "18/11/2024" },
  { id: "U014", unit: "Sala 12", building: "Centro Empresarial Norte", condo: "C.E. Norte", owner: "Beatriz Carvalho Nunes", cpf: "***.***.198-90", phone: "(11) 9****-9876", email: "beatriz.nunes@empresa.com", status: "Pendente", process: "PRC-2024-0543", value: 6800, debt: 20400, since: "01/03/2024", nextDue: "29/01/2025", city: "Santo André" },
  { id: "U015", unit: "Apto 73", building: "Cond. Alameda das Árvores", condo: "Alameda das Árvores", owner: "Diego Fernandes Mota", cpf: "***.***.632-12", phone: "(11) 9****-3210", email: "diego.mota@email.com", status: "Em andamento", process: "PRC-2024-0912", value: 4100, debt: 12300, since: "17/05/2024", nextDue: "17/02/2025", city: "São Paulo" },
];

const SEED_INCOMING: IncomingProcess[] = [
  { id: "P101", unit: "Apto 305", building: "Ed. Jardins do Lago", condo: "Jardins do Lago", city: "São Paulo", owner: "Marina Alves Teixeira", cpf: "***.***.910-45", phone: "(11) 9****-1122", email: "marina.teixeira@email.com", process: "PRC-2025-0102", value: 4300, debt: 4300, assignedAt: "20/01/2025" },
  { id: "P102", unit: "Casa 09", building: "Cond. Recanto Feliz", condo: "Recanto Feliz", city: "Barueri", owner: "Eduardo Nascimento Rocha", cpf: "***.***.663-27", phone: "(11) 9****-3344", email: "e.rocha@email.com", process: "PRC-2025-0107", value: 5100, debt: 5100, assignedAt: "21/01/2025" },
];

const NOTIFS: Notif[] = [
  { id: 1, type: "nova_unidade", title: "Nova unidade vinculada", desc: "Apto 149 · Res. Primavera foi vinculado ao escritório", time: "há 2h", read: false },
  { id: 2, type: "pagamento", title: "Pagamento recebido", desc: "R$ 3.450,00 referente a Apto 203 · Ed. Monte Carlo", time: "há 5h", read: false },
  { id: 3, type: "vencimento", title: "Vencimento próximo", desc: "Apto 87 · Cond. Solar das Palmeiras vence em 3 dias", time: "há 8h", read: false },
  { id: 4, type: "alteracao", title: "Alteração cadastral", desc: "Dados de Carlos Eduardo Mendes atualizados pela LLZ", time: "há 1d", read: true },
  { id: 5, type: "aprovacao", title: "Acordo aprovado", desc: "Acordo de parcelamento para Apto 65 aprovado", time: "há 1d", read: true },
  { id: 6, type: "conclusao", title: "Processo encerrado", desc: "PRC-2023-1456 concluído com sucesso · Cobertura 01", time: "há 2d", read: true },
  { id: 7, type: "vencimento", title: "Vencimento próximo", desc: "Apto 31 · Cond. Jardim Europa vence amanhã", time: "há 2d", read: true },
  { id: 8, type: "alteracao", title: "Mudança de status", desc: "Loja 08 · Shopping Galeria Norte alterada para Cancelado", time: "há 3d", read: true },
];

const TIMELINE: TimelineEvent[] = [
  { id: 1, date: "14/01/2025", time: "09:32", user: "Dr. João Silva", type: "observacao", desc: "Proprietário confirmou interesse em acordo extrajudicial. Aguardando proposta formal da LLZ.", category: "Observação" },
  { id: 2, date: "10/01/2025", time: "14:15", user: "LLZ Sistema", type: "status", desc: "Status alterado de Pendente para Em andamento após confirmação de documentação completa.", category: "Status" },
  { id: 3, date: "20/12/2024", time: "11:00", user: "LLZ Operador", type: "documento", desc: "Planilha de débitos atualizada gerada e enviada ao escritório por e-mail.", category: "Documento" },
  { id: 4, date: "05/12/2024", time: "16:45", user: "Dr. João Silva", type: "processo", desc: "Processo iniciado. Notificação extrajudicial enviada ao proprietário via Correios (AR).", category: "Processo" },
  { id: 5, date: "15/03/2024", time: "10:30", user: "LLZ Sistema", type: "cadastro", desc: "Unidade vinculada ao escritório Santos & Associados Advogados.", category: "Cadastro" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Toast system (leve, sem dependências externas) ───────────────────────────
type ToastMsg = { id: number; text: string; kind: "success" | "info" };
let toastListeners: Array<(t: ToastMsg) => void> = [];
let toastSeq = 0;
function toast(text: string, kind: ToastMsg["kind"] = "success") {
  const t: ToastMsg = { id: ++toastSeq, text, kind };
  toastListeners.forEach(fn => fn(t));
}
function ToastHost() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const fn = (t: ToastMsg) => {
      setItems(prev => [...prev, t]);
      setTimeout(() => setItems(prev => prev.filter(i => i.id !== t.id)), 4000);
    };
    toastListeners.push(fn);
    return () => { toastListeners = toastListeners.filter(l => l !== fn); };
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 w-[340px]">
      {items.map(t => (
        <div key={t.id} className="bg-white border border-border shadow-lg rounded-lg px-4 py-3 flex items-start gap-2.5">
          {t.kind === "success"
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            : <Info className="w-4 h-4 text-[#0042C3] shrink-0 mt-0.5" />}
          <p className="text-xs text-gray-700 leading-relaxed">{t.text}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Geração simulada de documentos (protótipo — sem backend real) ────────────
// Nota: em produção, a emissão de planilhas, extratos, NV e acordos deve ser
// feita por serviço backend auditável, com dados reais validados e revisão
// jurídica/compliance antes de qualquer geração com efeito legal.
function downloadMock(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function gerarPlanilhaDebitos(unit: Unit) {
  const linhas = [
    "Mês,Valor,Status",
    `Jan/2025,${unit.value},Pendente`,
    `Dez/2024,${unit.value},Pendente`,
    `Nov/2024,${unit.value},Pendente`,
    `Out/2024,${unit.value},${unit.debt > 0 ? "Pendente" : "Pago"}`,
    "",
    `Débito total,${unit.debt},`,
  ].join("\n");
  downloadMock(`planilha-debitos-${unit.process}.csv`, linhas);
  toast(`Planilha de débitos de ${unit.unit} · ${unit.process} gerada (arquivo de demonstração).`);
}
function gerarExtratoPdf(unit: Unit) {
  const texto = `EXTRATO — DEMONSTRAÇÃO (protótipo, não é documento oficial)\nProcesso: ${unit.process}\nUnidade: ${unit.unit} · ${unit.condo}\nProprietário: ${unit.owner}\nValor mensal: ${brl(unit.value)}\nDébito total: ${brl(unit.debt)}\nVinculado em: ${unit.since}\n`;
  downloadMock(`extrato-${unit.process}.txt`, texto);
  toast(`Extrato de ${unit.unit} gerado (arquivo de demonstração — não substitui extrato oficial).`);
}

// ─── Modal genérico ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxWidth = "max-w-lg" }: { title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(5,15,36,0.5)" }} onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input {...props} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30 focus:border-[#0042C3]" />
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const SC: Record<Status, { bg: string; text: string; border: string }> = {
  "Em andamento": { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  "Novo":         { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200" },
  "Pago":         { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200" },
  "Concluído":    { bg: "bg-gray-50",    text: "text-gray-500",   border: "border-gray-200" },
  "Pendente":     { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200" },
  "Cancelado":    { bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200" },
  "Aguardando ação": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "Encerrado":    { bg: "bg-slate-50",   text: "text-slate-500",  border: "border-slate-200" },
};
function StatusBadge({ status }: { status: Status }) {
  const c = SC[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.text.replace("text-", "bg-")}`} />
      {status}
    </span>
  );
}

const NOTIF_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  nova_unidade: { icon: Building2,     color: "text-blue-600",   bg: "bg-blue-50" },
  pagamento:    { icon: CreditCard,    color: "text-emerald-600",bg: "bg-emerald-50" },
  vencimento:   { icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50" },
  alteracao:    { icon: Edit2,         color: "text-purple-600", bg: "bg-purple-50" },
  aprovacao:    { icon: CheckCircle2,  color: "text-emerald-600",bg: "bg-emerald-50" },
  conclusao:    { icon: CheckCheck,    color: "text-gray-600",   bg: "bg-gray-50" },
};
const TL_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  observacao: { icon: BookOpen,   color: "text-blue-600" },
  status:     { icon: CircleDot,  color: "text-violet-600" },
  documento:  { icon: FileText,   color: "text-amber-600" },
  processo:   { icon: Briefcase,  color: "text-[#0042C3]" },
  cadastro:   { icon: UserCheck,  color: "text-emerald-600" },
};

// ─── LoginView ────────────────────────────────────────────────────────────────
function LoginView({ onLogin }: { onLogin: () => void }) {
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("joao.silva@santosadvogados.com.br");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("mfa"); }, 900);
  };
  const handleMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 700);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[460px] flex-shrink-0 flex-col justify-between p-12" style={{ backgroundColor: "#050F24" }}>
        <div>
          <img src={logo} alt="LLZ Garantidora" className="h-9 w-auto brightness-0 invert" />
          <p className="mt-2 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3A6DB5" }}>Portal Jurídico</p>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="text-[2rem] font-bold text-white leading-tight">
              Gestão jurídica<br />integrada para<br />
              <span style={{ color: "#4A90E2" }}>escritórios parceiros.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "#7A9AC4" }}>
              Acesse suas unidades, acompanhe processos em tempo real e mantenha rastreabilidade completa com segurança corporativa.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Unidades ativas",     value: "47" },
              { label: "Processos em aberto", value: "31" },
              { label: "Concluídos este ano",  value: "156" },
              { label: "Disponibilidade",      value: "99.9%" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7A9AC4" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ color: "#3A6DB5" }}>
          <Shield className="w-3.5 h-3.5" />
          <p className="text-xs">Protegido por MFA e criptografia ponta-a-ponta</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <img src={logo} alt="LLZ" className="h-8 w-auto" />
          </div>

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Acessar o Portal</h1>
                <p className="mt-1 text-sm text-gray-500">Portal Jurídico · LLZ Garantidora</p>
              </div>
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail profissional</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0042C3]/20 focus:border-[#0042C3] transition-colors"
                      placeholder="seu@escritorio.com.br" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0042C3]/20 focus:border-[#0042C3] transition-colors"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <button type="button" className="text-xs font-semibold text-[#0042C3] hover:underline">Esqueci minha senha</button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                  style={{ backgroundColor: "#0042C3" }}>
                  {loading ? "Verificando..." : "Continuar →"}
                </button>
              </form>
              <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
                Acesso exclusivo para escritórios de advocacia credenciados.<br />Solicite acesso à LLZ Garantidora.
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("credentials")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Verificação em dois fatores</h1>
                <p className="mt-1 text-sm text-gray-500">Insira o código do seu aplicativo autenticador</p>
              </div>
              <div className="p-4 rounded-xl mb-6 flex items-start gap-3 bg-[#EEF3FB] border border-[#C2D5F0]">
                <Smartphone className="w-4 h-4 mt-0.5 shrink-0 text-[#0042C3]" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Abra o Google Authenticator ou Authy e insira o código de 6 dígitos gerado para <strong className="text-gray-800">{email}</strong>.
                </p>
              </div>
              <form onSubmit={handleMfa} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código de verificação</label>
                  <input type="text" value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full py-3 border border-gray-200 rounded-lg text-center text-2xl font-mono tracking-[0.6em] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0042C3]/20 focus:border-[#0042C3] transition-colors"
                    placeholder="000000" maxLength={6} autoFocus />
                </div>
                <button type="submit" disabled={loading || mfaCode.length < 6}
                  className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: "#0042C3" }}>
                  {loading ? "Autenticando..." : "Entrar no portal"}
                </button>
              </form>
              <button className="mt-4 w-full text-center text-sm font-semibold text-[#0042C3] hover:underline">
                Não recebi o código · Reenviar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function getNavItems(unreadCount: number, incomingCount: number) {
  return [
    { id: "dashboard" as View,      icon: LayoutDashboard, label: "Dashboard" },
    { id: "units" as View,          icon: Building2,       label: "Minhas Unidades" },
    { id: "processes" as View,      icon: Briefcase,       label: "Processos", badge: incomingCount },
    { id: "notifications" as View,  icon: Bell,            label: "Notificações", badge: unreadCount },
    { id: "reports" as View,        icon: BarChart3,       label: "Relatórios" },
    { id: "acting-history" as View, icon: Archive,         label: "Hist. de Atuação" },
    { id: "history" as View,        icon: History,         label: "Histórico" },
  ];
}

function Sidebar({ view, setView, unreadCount, incomingCount, onLogout, collapsed, onToggleCollapsed }: {
  view: View; setView: (v: View) => void; unreadCount: number; incomingCount: number; onLogout: () => void;
  collapsed: boolean; onToggleCollapsed: () => void;
}) {
  const NAV = getNavItems(unreadCount, incomingCount);

  return (
    <aside className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-200 ${collapsed ? "w-[72px]" : "w-60"}`} style={{ backgroundColor: "#050F24" }}>
      {/* Logo */}
      <div className={`px-5 py-5 border-b ${collapsed ? "flex justify-center px-0" : ""}`} style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <img src={logo} alt="LLZ Garantidora" className="h-8 w-auto brightness-0 invert" style={collapsed ? { maxWidth: 28, objectFit: "contain" } : undefined} />
        {!collapsed && <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-1" style={{ color: "#3A6DB5" }}>Portal Jurídico</p>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ id, icon: Icon, label, badge }) => {
          const active = view === id;
          return (
            <button key={id} onClick={() => setView(id)} title={collapsed ? label : undefined}
              className={`relative w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${collapsed ? "justify-center px-0" : "px-3"} ${active ? "text-white" : "hover:bg-white/5"}`}
              style={active ? { backgroundColor: "#0042C3", color: "white" } : { color: "#8FA8CC" }}>
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && badge ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none">{badge}</span>
              ) : null}
              {collapsed && badge ? (
                <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-0.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <button onClick={onToggleCollapsed} title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/5 ${collapsed ? "justify-center px-0" : "px-3"}`}
          style={{ color: "#5A7AA8" }}>
          {collapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0" />}
          {!collapsed && <span className="flex-1">Recolher menu</span>}
        </button>
        <button onClick={() => setView("profile")} title={collapsed ? "Dr. João Silva" : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${collapsed ? "justify-center px-0" : "px-3"} ${view === "profile" ? "text-white" : "hover:bg-white/5"}`}
          style={view === "profile" ? { backgroundColor: "#0042C3" } : { color: "#8FA8CC" }}>
          <User className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: view === "profile" ? "white" : "#C5D5EA" }}>Dr. João Silva</p>
              <p className="text-[10px] truncate" style={{ color: "#5A7AA8" }}>Santos &amp; Associados</p>
            </div>
          )}
        </button>
        <button onClick={onLogout} title={collapsed ? "Sair" : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-400 ${collapsed ? "justify-center px-0" : "px-3"}`}
          style={{ color: "#5A7AA8" }}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Sair"}
        </button>
      </div>
    </aside>
  );
}

// ─── MobileNavDrawer ────────────────────────────────────────────────────────────
function MobileNavDrawer({ view, setView, unreadCount, incomingCount, onLogout, open, onClose }: {
  view: View; setView: (v: View) => void; unreadCount: number; incomingCount: number; onLogout: () => void;
  open: boolean; onClose: () => void;
}) {
  if (!open) return null;
  const NAV = getNavItems(unreadCount, incomingCount);
  const go = (v: View) => { setView(v); onClose(); };
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col" style={{ backgroundColor: "#050F24" }}>
        <div className="px-5 py-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <img src={logo} alt="LLZ Garantidora" className="h-8 w-auto brightness-0 invert" />
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-1" style={{ color: "#3A6DB5" }}>Portal Jurídico</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, icon: Icon, label, badge }) => {
            const active = view === id;
            return (
              <button key={id} onClick={() => go(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${active ? "text-white" : "hover:bg-white/5"}`}
                style={active ? { backgroundColor: "#0042C3", color: "white" } : { color: "#8FA8CC" }}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white leading-none">{badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-0.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button onClick={() => go("profile")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${view === "profile" ? "text-white" : "hover:bg-white/5"}`}
            style={view === "profile" ? { backgroundColor: "#0042C3" } : { color: "#8FA8CC" }}>
            <User className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: view === "profile" ? "white" : "#C5D5EA" }}>Dr. João Silva</p>
              <p className="text-[10px] truncate" style={{ color: "#5A7AA8" }}>Santos &amp; Associados</p>
            </div>
          </button>
          <button onClick={() => { onClose(); onLogout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{ color: "#5A7AA8" }}>
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TopHeader ────────────────────────────────────────────────────────────────
function TopHeader({ title, subtitle, actions, view, setView, unreadCount, notifs, onMarkOne, onOpenMobileNav }: {
  title: string; subtitle?: string; actions?: React.ReactNode;
  view: View; setView: (v: View) => void; unreadCount: number;
  notifs: Notif[]; onMarkOne: (id: number) => void; onOpenMobileNav: () => void;
}) {
  const [showNotifDrop, setShowNotifDrop] = useState(false);
  const recent = notifs.filter(n => !n.read).slice(0, 5);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-border flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3.5">
      <button onClick={onOpenMobileNav} className="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <div className="relative">
          <button onClick={() => setShowNotifDrop(v => !v)} className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
          {showNotifDrop && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNotifDrop(false)} />
              <div className="absolute right-0 top-full mt-2 w-[90vw] max-w-80 bg-white rounded-xl border border-border shadow-lg z-30 overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">Notificações</p>
                  {unreadCount > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{unreadCount} novas</span>}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {recent.map(n => {
                    const cfg = NOTIF_ICONS[n.type] || { icon: Bell, color: "text-gray-500", bg: "bg-gray-50" };
                    const Icon = cfg.icon;
                    return (
                      <button key={n.id} onClick={() => { onMarkOne(n.id); setShowNotifDrop(false); setView("notifications"); }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </button>
                    );
                  })}
                  {recent.length === 0 && (
                    <p className="px-4 py-6 text-center text-xs text-gray-400">Nenhuma notificação nova.</p>
                  )}
                </div>
                <button onClick={() => { setShowNotifDrop(false); setView("notifications"); }}
                  className="w-full py-2.5 text-xs font-bold text-[#0042C3] hover:bg-gray-50 border-t border-border transition-colors">
                  Ver todas
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#0042C3" }}>JS</div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-tight">Dr. João Silva</p>
            <p className="text-[10px] text-gray-400">Santos &amp; Associados</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── DashboardView ────────────────────────────────────────────────────────────
function DashboardView({ units, setView, setSelectedUnit }: { units: Unit[]; setView: (v: View) => void; setSelectedUnit: (u: Unit) => void }) {
  const activeUnits = units.filter(u => !["Concluído", "Encerrado", "Cancelado"].includes(u.status));
  const debtSobGestao = activeUnits.reduce((sum, u) => sum + u.debt, 0);
  const honorariosEmAberto = activeUnits.reduce((sum, u) => sum + Math.round(u.debt * 0.2), 0);

  const kpis = [
    { label: "Unidades ativas",        value: "47",  sub: "+5 este mês",   color: "#0042C3", icon: Building2,     trend: "up" },
    { label: "Processos ativos",       value: "31",  sub: "8 aguardando",  color: "#7C3AED", icon: Briefcase,     trend: "neutral" },
    { label: "Aguardando pagamento",   value: "8",   sub: "R$ 45.200 total",color: "#D97706", icon: CreditCard,   trend: "down" },
    { label: "Processos concluídos",   value: "156", sub: "este ano",      color: "#059669", icon: CheckCircle2,  trend: "up" },
    { label: "Novas unidades (30d)",   value: "5",   sub: "2 esta semana", color: "#0891B2", icon: ArrowUpRight,  trend: "up" },
    { label: "Pendências abertas",     value: "12",  sub: "3 urgentes",    color: "#DC2626", icon: AlertCircle,   trend: "neutral" },
    { label: "Honorários em aberto",   value: brl(honorariosEmAberto), sub: "estimado · unidades ativas", color: "#0F766E", icon: FileCheck,  trend: "neutral" },
    { label: "Débito total sob gestão", value: brl(debtSobGestao), sub: `${activeUnits.length} unidades ativas`, color: "#B91C1C", icon: Wallet,  trend: "neutral" },
  ];

  const upcoming = units.filter(u => u.nextDue).slice(0, 5);
  const alerts = units.filter(u => u.status === "Aguardando ação" || u.status === "Pendente").slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                {kpi.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                {kpi.trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{kpi.label}</p>
              <p className="text-[10px] font-medium mt-1" style={{ color: kpi.color }}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-gray-800">Requer atenção</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{alerts.length}</span>
              </div>
              <button onClick={() => setView("units")} className="text-xs font-semibold text-[#0042C3] hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {alerts.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setSelectedUnit(u); setView("unit-detail"); }}>
                  <div className="w-8 h-8 rounded-lg bg-[#EEF3FB] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-[#0042C3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{u.unit} · {u.building}</p>
                    <p className="text-xs text-gray-400 truncate">{u.owner} · {u.process}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={u.status} />
                    {u.nextDue && <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">{u.nextDue}</span>}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0042C3]" />
                <h2 className="text-sm font-bold text-gray-800">Próximos vencimentos</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              {upcoming.map(u => {
                const days = u.nextDue === "25/01/2025" || u.nextDue === "26/01/2025" ? "3d" : u.nextDue === "28/01/2025" ? "5d" : u.nextDue === "29/01/2025" ? "6d" : u.nextDue === "30/01/2025" ? "7d" : "30d+";
                const urgent = ["3d", "5d"].includes(days);
                return (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedUnit(u); setView("unit-detail"); }}>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-md w-10 text-center ${urgent ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"}`}>{days}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.unit} · {u.condo}</p>
                      <p className="text-xs text-gray-400">{u.owner}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-800">{brl(u.value)}</p>
                      <p className="text-[10px] text-gray-400">{u.nextDue}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </div>
    </div>
  );
}

// ─── UnitsView ────────────────────────────────────────────────────────────────
function UnitsView({ units, onSelectUnit }: { units: Unit[]; onSelectUnit: (u: Unit) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [sortBy, setSortBy] = useState<keyof Unit>("since");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let list = units.filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || u.unit.toLowerCase().includes(q) || u.owner.toLowerCase().includes(q) ||
        u.building.toLowerCase().includes(q) || u.process.toLowerCase().includes(q);
      const matchS = !statusFilter || u.status === statusFilter;
      return matchQ && matchS;
    });
    list = [...list].sort((a, b) => {
      const va = a[sortBy] ?? ""; const vb = b[sortBy] ?? "";
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return list;
  }, [units, search, statusFilter, sortBy, sortAsc]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const ALL_STATUSES: Status[] = ["Em andamento", "Novo", "Aguardando ação", "Pendente", "Pago", "Concluído", "Cancelado", "Encerrado"];

  const handleSort = (col: keyof Unit) => {
    if (sortBy === col) setSortAsc(v => !v); else { setSortBy(col); setSortAsc(true); }
  };
  const SortIcon = ({ col }: { col: keyof Unit }) => (
    sortBy === col ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-20" />
  );

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-border shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-3 p-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30 focus:border-[#0042C3]"
              placeholder="Buscar por unidade, proprietário, processo..." />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as Status | ""); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 border border-border rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30 cursor-pointer">
              <option value="">Todos os status</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
              <Plus className="w-3.5 h-3.5" /> Novo processo
            </button>
          </div>
        </div>
        <div className="px-3 pb-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{filtered.length} unidades encontradas</span>
          {statusFilter && (
            <button onClick={() => setStatusFilter("")} className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF3FB] text-[#0042C3] hover:bg-red-50 hover:text-red-600">
              {statusFilter} <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/80">
                {[
                  { label: "Unidade / Empreendimento", col: "unit" as keyof Unit, w: "" },
                  { label: "Proprietário", col: "owner" as keyof Unit, w: "" },
                  { label: "Status", col: "status" as keyof Unit, w: "w-36" },
                  { label: "Processo", col: "process" as keyof Unit, w: "w-36" },
                  { label: "Débito total", col: "debt" as keyof Unit, w: "w-32" },
                  { label: "Vinculado em", col: "since" as keyof Unit, w: "w-28" },
                  { label: "Próx. vencimento", col: "nextDue" as keyof Unit, w: "w-32" },
                  { label: "", col: "id" as keyof Unit, w: "w-20" },
                ].map(({ label, col, w }) => (
                  <th key={col} className={`px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider ${w} ${label ? "cursor-pointer hover:text-gray-600 select-none" : ""}`}
                    onClick={() => label && handleSort(col)}>
                    <div className="flex items-center gap-1">
                      {label}
                      {label && <SortIcon col={col} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => onSelectUnit(u)}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 text-sm">{u.unit}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{u.building}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700 font-medium">{u.owner}</p>
                    <p className="text-xs text-gray-400 font-mono">{u.cpf}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{u.process}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${u.debt > 0 ? "text-gray-900" : "text-gray-300"}`}>{u.debt > 0 ? brl(u.debt) : "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.since}</td>
                  <td className="px-4 py-3">
                    {u.nextDue ? (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{u.nextDue}</span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-[#EEF3FB] text-[#0042C3]" title="Ver detalhe"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Mais ações"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">Nenhuma unidade encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-gray-50/50">
            <p className="text-xs text-gray-400">Página {page} de {pages} · {filtered.length} registros</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${p === page ? "text-white" : "text-gray-600 hover:bg-gray-200"}`}
                  style={p === page ? { backgroundColor: "#0042C3" } : {}}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── UnitDetailView ───────────────────────────────────────────────────────────
function UnitDetailView({ unit, onBack, onUpdateUnit, initialTab = "resumo" }: {
  unit: Unit; onBack: () => void; onUpdateUnit: (u: Unit) => void; initialTab?: "resumo" | "processo" | "financeiro" | "timeline" | "documentos" | "historico";
}) {
  const [tab, setTab] = useState<"resumo" | "processo" | "financeiro" | "timeline" | "documentos" | "historico">(initialTab);
  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerForm, setOwnerForm] = useState({ owner: unit.owner, cpf: unit.cpf, phone: unit.phone, email: unit.email });
  const [showNv, setShowNv] = useState(false);
  const [showAcordo, setShowAcordo] = useState(false);
  const [nvDate, setNvDate] = useState("");
  const [nvValue, setNvValue] = useState(String(unit.value));
  const [acEntrada, setAcEntrada] = useState("");
  const [acParcelas, setAcParcelas] = useState("3");

  const saveOwner = () => {
    onUpdateUnit({ ...unit, ...ownerForm });
    setEditingOwner(false);
    toast("Dados cadastrais atualizados. Necessário validar antes do ajuizamento (emissão de matrícula).");
  };
  const encerrarProcesso = () => {
    onUpdateUnit({ ...unit, status: "Encerrado", endedAt: "22/07/2026", honorarios: unit.honorarios ?? Math.round(unit.value * 0.2) });
    toast(`Processo ${unit.process} encerrado. Unidade movida para o Relatório de Histórico de Atuação (somente leitura).`);
    onBack();
  };
  const confirmNv = () => {
    if (!nvDate) return;
    onUpdateUnit({ ...unit, nextDue: nvDate, value: Number(nvValue) || unit.value });
    toast(`Novo vencimento (NV) gerado: ${brl(Number(nvValue) || unit.value)} para ${nvDate}.`);
    setShowNv(false);
  };
  const confirmAcordo = () => {
    toast(`Acordo (AC) gerado para ${unit.process}: entrada de ${brl(Number(acEntrada) || 0)} + ${acParcelas}x. Documento de demonstração — requer validação jurídica antes de produção.`);
    setShowAcordo(false);
  };
  const [editingProcesso, setEditingProcesso] = useState(false);
  const [processoForm, setProcessoForm] = useState({ process: unit.process, status: unit.status, value: String(unit.value), debt: String(unit.debt) });
  const saveProcesso = () => {
    onUpdateUnit({ ...unit, process: processoForm.process, status: processoForm.status, value: Number(processoForm.value) || unit.value, debt: Number(processoForm.debt) || 0 });
    setEditingProcesso(false);
    toast("Processo atualizado.");
  };
  const ALL_STATUS_OPTS: Status[] = ["Em andamento", "Novo", "Aguardando ação", "Pendente", "Pago", "Concluído", "Cancelado", "Encerrado"];
  const TABS = [
    { id: "resumo",     label: "Resumo" },
    { id: "processo",   label: "Processo" },
    { id: "financeiro", label: "Financeiro" },
    { id: "timeline",   label: "Timeline" },
    { id: "documentos", label: "Documentos" },
    { id: "historico",  label: "Histórico" },
  ] as const;

  const docs = [
    { name: "Planilha de débitos",   date: "20/12/2024", type: "XLSX", size: "45 KB" },
    { name: "Notificação extrajudicial", date: "05/12/2024", type: "PDF", size: "128 KB" },
    { name: "Extrato completo",       date: "01/11/2024", type: "PDF", size: "89 KB" },
    { name: "Contrato de locação",    date: "15/03/2024", type: "PDF", size: "312 KB" },
  ];
  const histLog = [
    { date: "14/01/2025", time: "09:32", user: "Dr. João Silva",  acao: "Observação",        desc: "Adicionou observação ao processo" },
    { date: "10/01/2025", time: "14:15", user: "LLZ Sistema",     acao: "Mudança de status", desc: "Pendente → Em andamento" },
    { date: "20/12/2024", time: "11:00", user: "LLZ Operador",    acao: "Documento",         desc: "Planilha de débitos gerada" },
    { date: "05/12/2024", time: "16:45", user: "Dr. João Silva",  acao: "Processo",          desc: "Processo iniciado" },
    { date: "15/03/2024", time: "10:30", user: "LLZ Sistema",     acao: "Cadastro",          desc: "Unidade vinculada ao escritório" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-border shadow-sm mb-4">
        <div className="px-6 py-4 flex items-start gap-4">
          <button onClick={onBack} className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900">{unit.unit}</h1>
              <StatusBadge status={unit.status} />
              <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{unit.process}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{unit.building} · {unit.city}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button onClick={() => gerarPlanilhaDebitos(unit)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <FileDown className="w-3.5 h-3.5" /> Planilha
            </button>
            <button onClick={() => gerarExtratoPdf(unit)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">
              <Printer className="w-3.5 h-3.5" /> Extrato
            </button>
            <button onClick={() => { setTab("processo"); setEditingProcesso(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
              <Edit2 className="w-3.5 h-3.5" /> Editar processo
            </button>
            <button className="p-1.5 rounded-lg border border-border hover:bg-gray-50 text-gray-500">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="px-6 flex border-t border-border overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-[#0042C3] text-[#0042C3]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "resumo" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#0042C3]" />
              <h3 className="text-sm font-bold text-gray-800">Dados do proprietário</h3>
            </div>
            {!editingOwner ? (
              <div className="space-y-3">
                {[
                  { label: "Nome completo", value: unit.owner },
                  { label: "CPF", value: unit.cpf, mono: true },
                  { label: "Telefone", value: unit.phone },
                  { label: "E-mail", value: unit.email },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{f.label}</p>
                    <p className={`text-sm font-medium text-gray-800 mt-0.5 ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
                  </div>
                ))}
                <p className="text-[10px] text-gray-400 leading-relaxed pt-1">Dados cadastrais atualizados são necessários para ajuizamento (emissão de matrícula).</p>
                <button onClick={() => { setOwnerForm({ owner: unit.owner, cpf: unit.cpf, phone: unit.phone, email: unit.email }); setEditingOwner(true); }}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#0042C3] text-xs font-bold text-[#0042C3] hover:bg-[#EEF3FB] transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Editar dados cadastrais
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Nome completo" value={ownerForm.owner} onChange={e => setOwnerForm(f => ({ ...f, owner: e.target.value }))} />
                <Field label="CPF" value={ownerForm.cpf} onChange={e => setOwnerForm(f => ({ ...f, cpf: e.target.value }))} />
                <Field label="Telefone" value={ownerForm.phone} onChange={e => setOwnerForm(f => ({ ...f, phone: e.target.value }))} />
                <Field label="E-mail" type="email" value={ownerForm.email} onChange={e => setOwnerForm(f => ({ ...f, email: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => setEditingOwner(false)} className="py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button onClick={saveOwner} className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#0042C3]" />
              <h3 className="text-sm font-bold text-gray-800">Dados da unidade</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Unidade",      value: unit.unit },
                { label: "Condomínio",   value: unit.condo },
                { label: "Empreendimento", value: unit.building },
                { label: "Cidade",       value: unit.city },
                { label: "Vinculado em", value: unit.since },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-[#0042C3]" />
              <h3 className="text-sm font-bold text-gray-800">Situação financeira</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valor mensal</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{brl(unit.value)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Débito total acumulado</p>
                <p className={`text-xl font-bold mt-0.5 ${unit.debt > 0 ? "text-red-600" : "text-emerald-600"}`}>{unit.debt > 0 ? brl(unit.debt) : "Quitado"}</p>
              </div>
              {unit.nextDue && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Próximo vencimento</p>
                  <p className="text-sm font-bold text-amber-800 mt-0.5">{unit.nextDue}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => setShowNv(true)} className="py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Novo vencimento (NV)</button>
                <button onClick={() => setShowAcordo(true)} className="py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Gerar acordo (AC)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "processo" && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!editingProcesso ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Número do processo</p>
                  <p className="text-lg font-bold font-mono text-gray-900">{unit.process}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status atual</p>
                    <StatusBadge status={unit.status} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Iniciado em</p>
                  <p className="text-sm font-medium text-gray-800">{unit.since}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Responsável</p>
                  <p className="text-sm font-medium text-gray-800">Dr. João Silva · Santos &amp; Associados</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Número do processo" value={processoForm.process} onChange={e => setProcessoForm(f => ({ ...f, process: e.target.value }))} />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select value={processoForm.status} onChange={e => setProcessoForm(f => ({ ...f, status: e.target.value as Status }))}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30">
                    {ALL_STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Field label="Valor mensal (R$)" type="number" value={processoForm.value} onChange={e => setProcessoForm(f => ({ ...f, value: e.target.value }))} />
                <Field label="Débito total (R$)" type="number" value={processoForm.debt} onChange={e => setProcessoForm(f => ({ ...f, debt: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => setEditingProcesso(false)} className="py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button onClick={saveProcesso} className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ações do processo</p>
              <div className="space-y-2">
                <button onClick={() => setEditingProcesso(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:bg-[#EEF3FB] transition-colors text-sm font-medium text-[#0042C3] text-left">
                  <Edit2 className="w-4 h-4 shrink-0" /> Editar processo
                </button>
                <button onClick={() => gerarPlanilhaDebitos(unit)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white transition-colors text-sm font-bold text-left hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
                  <FileDown className="w-4 h-4 shrink-0" /> Emissão de planilha de débitos
                </button>
                <button onClick={() => gerarExtratoPdf(unit)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 text-left">
                  <Printer className="w-4 h-4 shrink-0" /> Emissão de extrato PDF
                </button>
                <button onClick={() => setShowNv(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 text-left">
                  <Calendar className="w-4 h-4 shrink-0" /> Geração de novo vencimento (NV)
                </button>
                <button onClick={() => setShowAcordo(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600 text-left">
                  <FileCheck className="w-4 h-4 shrink-0" /> Geração de acordo (AC)
                </button>
                <button onClick={() => { if (confirm(`Encerrar o processo ${unit.process}? O escritório perderá acesso ativo à unidade e ela passará ao Histórico de Atuação (somente leitura).`)) encerrarProcesso(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:bg-red-50 transition-colors text-sm font-medium text-red-500 text-left">
                  <XCircle className="w-4 h-4 shrink-0" /> Encerrar processo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {TIMELINE.map(ev => {
                const tlCfg = TL_ICONS[ev.type] || { icon: Info, color: "text-gray-500" };
                const Icon = tlCfg.icon;
                return (
                  <div key={ev.id} className="flex gap-4 relative">
                    <div className={`w-11 h-11 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center shrink-0 z-10 ring-2 ring-border`}>
                      <Icon className={`w-4 h-4 ${tlCfg.color}`} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-gray-800">{ev.user}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">{ev.category}</span>
                        <span className="text-[10px] text-gray-400">{ev.date} às {ev.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{ev.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "documentos" && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Documentos disponíveis</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
              <FileDown className="w-3.5 h-3.5" /> Emitir novo documento
            </button>
          </div>
          <div className="divide-y divide-border">
            {docs.map(d => (
              <div key={d.name} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.date} · {d.size}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.type === "PDF" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{d.type}</span>
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "historico" && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h3 className="text-sm font-bold text-gray-800">Histórico de alterações</h3>
            <p className="text-xs text-gray-400 mt-0.5">Todas as ações realizadas nesta unidade</p>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-border">
              {["Data", "Hora", "Usuário", "Ação", "Descrição"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {histLog.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{h.date}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{h.time}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-700">{h.user}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">{h.acao}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{h.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === "financeiro" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Resumo financeiro</h3>
            {[
              { label: "Valor mensal",   value: brl(unit.value),                  color: "text-gray-900" },
              { label: "Débito total",   value: unit.debt > 0 ? brl(unit.debt) : "Quitado", color: unit.debt > 0 ? "text-red-600" : "text-emerald-600" },
              { label: "Meses em aberto", value: unit.debt > 0 ? `${Math.round(unit.debt / unit.value)} meses` : "—", color: "text-gray-700" },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm text-gray-500">{f.label}</span>
                <span className={`text-sm font-bold ${f.color}`}>{f.value}</span>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => setShowNv(true)} className="py-2 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Novo vencimento (NV)</button>
              <button onClick={() => setShowAcordo(true)} className="py-2 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Gerar acordo (AC)</button>
              <button onClick={() => gerarPlanilhaDebitos(unit)} className="py-2 col-span-2 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>Emitir planilha de débitos</button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Vencimentos</h3>
            <div className="space-y-2">
              {[
                { mes: "Jan/2025", valor: unit.value, status: "Pendente" },
                { mes: "Dez/2024", valor: unit.value, status: "Pendente" },
                { mes: "Nov/2024", valor: unit.value, status: "Pendente" },
                { mes: "Out/2024", valor: unit.value, status: unit.debt > 0 ? "Pendente" : "Pago" },
              ].map(v => (
                <div key={v.mes} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-gray-700 font-medium">{v.mes}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800">{brl(v.valor)}</span>
                    <StatusBadge status={v.status as Status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNv && (
        <Modal title="Geração de novo vencimento (NV)" onClose={() => setShowNv(false)}>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{unit.unit} · {unit.process}</p>
            <Field label="Nova data de vencimento" type="date" value={nvDate} onChange={e => setNvDate(e.target.value)} />
            <Field label="Valor (R$)" type="number" value={nvValue} onChange={e => setNvValue(e.target.value)} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => setShowNv(false)} className="py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmNv} disabled={!nvDate} className="py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: "#0042C3" }}>Gerar NV</button>
            </div>
          </div>
        </Modal>
      )}

      {showAcordo && (
        <Modal title="Geração de acordo (AC)" onClose={() => setShowAcordo(false)}>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{unit.unit} · {unit.process} · Débito atual: {brl(unit.debt)}</p>
            <Field label="Valor de entrada (R$)" type="number" value={acEntrada} onChange={e => setAcEntrada(e.target.value)} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Número de parcelas</label>
              <select value={acParcelas} onChange={e => setAcParcelas(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30">
                {[1,2,3,6,9,12,18,24].map(n => <option key={n} value={n}>{n}x</option>)}
              </select>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">Documento de demonstração — validar cláusulas com jurídico antes de enviar ao proprietário.</p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => setShowAcordo(false)} className="py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmAcordo} className="py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>Gerar acordo</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ProcessesView ────────────────────────────────────────────────────────────
function ProcessesView({ units, incoming, onSelectUnit, onAccept, onAddProcess, onEditProcess }: {
  units: Unit[]; incoming: IncomingProcess[];
  onSelectUnit: (u: Unit) => void;
  onAccept: (p: IncomingProcess) => void;
  onAddProcess: (u: Unit) => void;
  onEditProcess: (id: string, patch: Partial<Unit>) => void;
}) {
  const [tabP, setTabP] = useState<"andamento" | "novos" | "todos">("andamento");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const ALL_STATUS_OPTS: Status[] = ["Em andamento", "Novo", "Aguardando ação", "Pendente", "Pago", "Concluído", "Cancelado", "Encerrado"];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [sortBy, setSortBy] = useState<keyof Unit>("since");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const emAndamento = units.filter(u => ["Em andamento", "Aguardando ação", "Pendente", "Novo"].includes(u.status));
  const baseList = tabP === "andamento" ? emAndamento : tabP === "todos" ? units : [];

  const filtered = useMemo(() => {
    let l = baseList.filter(u => {
      const q = search.toLowerCase();
      const matchQ = !q || u.unit.toLowerCase().includes(q) || u.owner.toLowerCase().includes(q) ||
        u.condo.toLowerCase().includes(q) || u.process.toLowerCase().includes(q);
      const matchS = !statusFilter || u.status === statusFilter;
      return matchQ && matchS;
    });
    l = [...l].sort((a, b) => {
      const va = a[sortBy] ?? ""; const vb = b[sortBy] ?? "";
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return l;
  }, [baseList, search, statusFilter, sortBy, sortAsc]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const list = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handleSort = (col: keyof Unit) => {
    if (sortBy === col) setSortAsc(v => !v); else { setSortBy(col); setSortAsc(true); }
  };
  const SortIcon = ({ col }: { col: keyof Unit }) => (
    sortBy === col ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-20" />
  );

  const [form, setForm] = useState({
    process: "", unit: "", building: "", condo: "", city: "", owner: "", cpf: "", phone: "", email: "",
    value: "", debt: "", status: "Novo" as Status,
  });
  const submitAdd = () => {
    if (!form.process || !form.unit || !form.owner) return;
    const newUnit: Unit = {
      id: `U${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      unit: form.unit, building: form.building || form.condo, condo: form.condo || form.building,
      owner: form.owner, cpf: form.cpf, phone: form.phone, email: form.email,
      status: form.status, process: form.process, value: Number(form.value) || 0, debt: Number(form.debt) || 0,
      since: "22/07/2026", city: form.city,
    };
    onAddProcess(newUnit);
    setShowAdd(false);
    setForm({ process: "", unit: "", building: "", condo: "", city: "", owner: "", cpf: "", phone: "", email: "", value: "", debt: "", status: "Novo" });
    toast(`Processo ${newUnit.process} adicionado manualmente.`);
  };

  const [editForm, setEditForm] = useState({ process: "", status: "Novo" as Status, value: "", debt: "" });
  const openEdit = (u: Unit) => { setEditing(u); setEditForm({ process: u.process, status: u.status, value: String(u.value), debt: String(u.debt) }); };
  const submitEdit = () => {
    if (!editing) return;
    onEditProcess(editing.id, { process: editForm.process, status: editForm.status, value: Number(editForm.value) || 0, debt: Number(editForm.debt) || 0 });
    setEditing(null);
    toast(`Processo ${editForm.process} atualizado.`);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-border shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-3 p-3">
          <div className="flex gap-1 flex-wrap">
            {[
              { id: "andamento" as const, label: "Em andamento" },
              { id: "novos" as const, label: `Novos atribuídos a mim${incoming.length ? ` (${incoming.length})` : ""}` },
              { id: "todos" as const, label: "Todos" },
            ].map(t => (
              <button key={t.id} onClick={() => { setTabP(t.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tabP === t.id ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                style={tabP === t.id ? { backgroundColor: "#0042C3" } : {}}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
            <Plus className="w-3.5 h-3.5" /> Novo processo
          </button>
        </div>
        {tabP !== "novos" && (
          <div className="flex flex-wrap items-center gap-3 px-3 pb-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30 focus:border-[#0042C3]"
                placeholder="Buscar por unidade, proprietário, processo..." />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as Status | ""); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-2 border border-border rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30 cursor-pointer">
                <option value="">Todos os status</option>
                {ALL_STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            {statusFilter && (
              <button onClick={() => setStatusFilter("")} className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF3FB] text-[#0042C3] hover:bg-red-50 hover:text-red-600">
                {statusFilter} <X className="w-3 h-3" />
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} processos encontrados</span>
          </div>
        )}
      </div>

      {tabP === "novos" ? (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h3 className="text-sm font-bold text-gray-800">Processos destinados a mim</h3>
            <p className="text-xs text-gray-400 mt-0.5">Aceite para vincular a unidade ao escritório e liberar as ações do processo.</p>
          </div>
          <div className="divide-y divide-border">
            {incoming.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{p.unit} · {p.condo}</p>
                  <p className="text-xs text-gray-400">{p.owner} · {p.process} · atribuído em {p.assignedAt}</p>
                </div>
                <span className="text-sm font-bold text-gray-800 shrink-0">{brl(p.value)}</span>
                <button onClick={() => onAccept(p)} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
                  Aceitar processo
                </button>
              </div>
            ))}
            {incoming.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhum processo novo no momento.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-border">
              {[
                { label: "Processo", col: "process" as keyof Unit },
                { label: "Unidade / Condomínio", col: "unit" as keyof Unit },
                { label: "Proprietário", col: "owner" as keyof Unit },
                { label: "Status", col: "status" as keyof Unit },
                { label: "Valor mensal", col: "value" as keyof Unit },
                { label: "Débito", col: "debt" as keyof Unit },
                { label: "Vinculado em", col: "since" as keyof Unit },
                { label: "", col: "id" as keyof Unit },
              ].map(({ label, col }) => (
                <th key={col} className={`px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap ${label ? "cursor-pointer hover:text-gray-600 select-none" : ""}`}
                  onClick={() => label && handleSort(col)}>
                  <div className="flex items-center gap-1">
                    {label}
                    {label && <SortIcon col={col} />}
                  </div>
                </th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {list.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onSelectUnit(u)}>
                    <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{u.process}</span>
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onSelectUnit(u)}>
                    <p className="font-semibold text-gray-800 text-sm">{u.unit}</p>
                    <p className="text-xs text-gray-400">{u.condo}</p>
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onSelectUnit(u)}>
                    <p className="text-sm text-gray-700">{u.owner}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{brl(u.value)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${u.debt > 0 ? "text-gray-900" : "text-gray-300"}`}>{u.debt > 0 ? brl(u.debt) : "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.since}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onSelectUnit(u)} className="p-1.5 rounded hover:bg-[#EEF3FB] text-[#0042C3]" title="Ver processo"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Editar processo"><Edit2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">Nenhum processo encontrado.</td></tr>
              )}
            </tbody>
          </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-gray-50/50">
              <p className="text-xs text-gray-400">Página {page} de {pages} · {filtered.length} registros</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${p === page ? "text-white" : "text-gray-600 hover:bg-gray-200"}`}
                    style={p === page ? { backgroundColor: "#0042C3" } : {}}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <Modal title="Adicionar novo processo" onClose={() => setShowAdd(false)} maxWidth="max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Número do processo" value={form.process} onChange={e => setForm(f => ({ ...f, process: e.target.value }))} placeholder="PRC-2026-0001" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status inicial</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30">
                {ALL_STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Unidade" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="Apto 12" />
            <Field label="Condomínio / Empreendimento" value={form.condo} onChange={e => setForm(f => ({ ...f, condo: e.target.value }))} />
            <Field label="Cidade" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <Field label="Valor mensal (R$)" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
            <Field label="Débito atual (R$)" type="number" value={form.debt} onChange={e => setForm(f => ({ ...f, debt: e.target.value }))} />
            <div />
            <Field label="Proprietário (nome)" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
            <Field label="CPF" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00 (fictício)" />
            <Field label="Telefone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Field label="E-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed mt-3">Use sempre dados fictícios em ambiente de protótipo. Nunca insira CPF, telefone ou e-mail reais aqui.</p>
          <div className="grid grid-cols-2 gap-2 pt-4">
            <button onClick={() => setShowAdd(false)} className="py-2 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={submitAdd} className="py-2 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>Adicionar processo</button>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title={`Editar processo · ${editing.unit}`} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <Field label="Número do processo" value={editForm.process} onChange={e => setEditForm(f => ({ ...f, process: e.target.value }))} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Status }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0042C3]/30">
                {ALL_STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Valor mensal (R$)" type="number" value={editForm.value} onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))} />
            <Field label="Débito total (R$)" type="number" value={editForm.debt} onChange={e => setEditForm(f => ({ ...f, debt: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => setEditing(null)} className="py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={submitEdit} className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── NotificationsView ───────────────────────────────────────────────────────
const NOTIF_TYPE_LABELS: Record<string, { label: string; desc: string }> = {
  nova_unidade: { label: "Nova unidade vinculada", desc: "Quando uma unidade é atribuída ao escritório" },
  pagamento:    { label: "Pagamento recebido",      desc: "Quando um pagamento é registrado" },
  vencimento:   { label: "Vencimento próximo",      desc: "Lembretes de vencimentos se aproximando" },
  alteracao:    { label: "Alteração cadastral",     desc: "Mudanças de dados ou de status" },
  aprovacao:    { label: "Acordo aprovado",         desc: "Quando um acordo é aprovado" },
  conclusao:    { label: "Processo concluído",      desc: "Quando um processo é encerrado" },
};
function NotifToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? "" : "bg-gray-300"}`}
      style={checked ? { backgroundColor: "#0042C3" } : {}}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}
function NotificationsView({ notifs, setNotifs }: { notifs: Notif[]; setNotifs: (n: Notif[]) => void }) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    nova_unidade: true, pagamento: true, vencimento: true, alteracao: true, aprovacao: true, conclusao: true,
  });
  const unread = notifs.filter(n => !n.read).length;
  const list = (filter === "unread" ? notifs.filter(n => !n.read) : notifs).filter(n => prefs[n.type] !== false);

  const markAll = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const markOne = (id: number) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  const togglePref = (type: string) => {
    setPrefs(p => ({ ...p, [type]: !p[type] }));
    toast(`Notificações de "${NOTIF_TYPE_LABELS[type]?.label ?? type}" ${prefs[type] ? "desativadas" : "ativadas"}.`, "info");
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {(["all", "unread"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  style={filter === f ? { backgroundColor: "#0042C3" } : {}}>
                  {f === "all" ? "Todas" : `Não lidas ${unread > 0 ? `(${unread})` : ""}`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1.5 text-xs font-semibold text-[#0042C3] hover:underline">
                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas como lidas
              </button>
            )}
            <button onClick={() => setShowPrefs(true)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">
              <Settings className="w-3.5 h-3.5" /> Gerenciar notificações
            </button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {list.map(n => {
            const cfg = NOTIF_ICONS[n.type] || { icon: Bell, color: "text-gray-500", bg: "bg-gray-50" };
            const Icon = cfg.icon;
            return (
              <div key={n.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.read ? "bg-[#F5F8FF]" : "hover:bg-gray-50"}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#0042C3] shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markOne(n.id)} className="text-[10px] font-semibold text-gray-400 hover:text-[#0042C3] whitespace-nowrap mt-0.5">
                    Marcar lida
                  </button>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="text-center py-12">
              <Inbox className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhuma notificação não lida.</p>
            </div>
          )}
        </div>
      </div>

      {showPrefs && (
        <Modal title="Gerenciar notificações" onClose={() => setShowPrefs(false)}>
          <p className="text-xs text-gray-500 mb-4">Escolha quais tipos de notificação a plataforma pode te enviar.</p>
          <div className="space-y-1">
            {Object.entries(NOTIF_TYPE_LABELS).map(([type, info]) => (
              <div key={type} className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{info.label}</p>
                  <p className="text-xs text-gray-400">{info.desc}</p>
                </div>
                <NotifToggle checked={prefs[type] !== false} onChange={() => togglePref(type)} />
              </div>
            ))}
          </div>
          <button onClick={() => setShowPrefs(false)} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
            Concluído
          </button>
        </Modal>
      )}
    </div>
  );
}

// ─── ReportsView ──────────────────────────────────────────────────────────────
function ReportsView({ units }: { units: Unit[] }) {
  const closed = units.filter(u => u.status === "Concluído" || u.status === "Encerrado" || u.status === "Cancelado");
  return (
    <div className="p-6 max-w-5xl">
      <div className="bg-white rounded-xl border border-border shadow-sm mb-4 p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Filtros do relatório</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Unidade", "Condomínio", "Período", "Status"].map(f => (
            <div key={f}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f}</label>
              <input type="text" placeholder={`Filtrar por ${f.toLowerCase()}`}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-gray-50 focus:outline-none text-gray-600" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
            <Search className="w-3.5 h-3.5" /> Gerar relatório
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <FileDown className="w-3.5 h-3.5" /> Exportar PDF
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> Exportar Excel
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-800">Processos encerrados · somente leitura</h3>
          <span className="text-xs text-gray-400">({closed.length} registros)</span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">
            {["Unidade", "Condomínio", "Proprietário", "Processo", "Valor mensal", "Status", "Vinculado em"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {closed.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{u.unit}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{u.condo}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.owner}</td>
                <td className="px-4 py-3"><span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{u.process}</span></td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{brl(u.value)}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-xs text-gray-500">{u.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── ActingHistoryView (Relatório de Histórico de Atuação · somente leitura) ──
function ActingHistoryView({ units }: { units: Unit[] }) {
  const encerradas = units.filter(u => ["Encerrado", "Cancelado", "Concluído"].includes(u.status));
  const exportar = () => {
    const linhas = [
      "Unidade,Condominio,Status do processo,Valor do processo,Valores a receber (honorarios),Periodo de atuacao",
      ...encerradas.map(u => `${u.unit},${u.condo},${u.status},${u.value},${u.honorarios ?? Math.round(u.value * 0.2)},${u.since} a ${u.endedAt ?? "—"}`),
    ].join("\n");
    downloadMock("historico-de-atuacao.csv", linhas);
    toast("Relatório de Histórico de Atuação exportado.");
  };
  return (
    <div className="p-6 max-w-5xl">
      <div className="rounded-xl border p-4 mb-4 flex items-start gap-3" style={{ backgroundColor: "#FFF8EB", borderColor: "#F5E0B8" }}>
        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Somente leitura. O escritório encerrou o acesso ativo a estas unidades — não é possível editar dados, gerar documentos ou executar qualquer ação sobre os processos listados abaixo.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-800">Relatório de Histórico de Atuação</h3>
            <span className="text-xs text-gray-400">({encerradas.length} unidades)</span>
          </div>
          <button onClick={exportar} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">
            {["Unidade / Condomínio", "Status do processo", "Valor do processo", "Valores a receber (honorários)", "Período de atuação"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {encerradas.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-gray-800">{u.unit}</p>
                  <p className="text-xs text-gray-400">{u.condo}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{brl(u.value)}</td>
                <td className="px-4 py-3 text-sm font-bold text-emerald-700">{brl(u.honorarios ?? Math.round(u.value * 0.2))}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{u.since} → {u.endedAt ?? "—"}</td>
              </tr>
            ))}
            {encerradas.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">Nenhuma unidade com acesso encerrado ainda.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── HistoryView ──────────────────────────────────────────────────────────────
function HistoryView() {
  const all = [
    { date: "14/01/2025", time: "09:32", user: "Dr. João Silva",  type: "Processo",  unit: "Apto 42",   desc: "Adicionou observação ao processo PRC-2024-0842" },
    { date: "14/01/2025", time: "07:15", user: "LLZ Sistema",     type: "Pagamento",  unit: "Apto 203",  desc: "Pagamento de R$ 3.450,00 registrado" },
    { date: "13/01/2025", time: "16:40", user: "Dr. João Silva",  type: "Observação", unit: "Apto 31",   desc: "Registrada tratativa telefônica com proprietária" },
    { date: "13/01/2025", time: "14:20", user: "LLZ Operador",    type: "Encerramento",unit: "Cob. 01",  desc: "Processo PRC-2023-1456 marcado como Encerrado" },
    { date: "10/01/2025", time: "14:15", user: "LLZ Sistema",     type: "Status",     unit: "Apto 42",   desc: "Status alterado de Pendente para Em andamento" },
    { date: "08/01/2025", time: "10:00", user: "LLZ Sistema",     type: "Cadastro",   unit: "Apto 149",  desc: "Unidade Apto 149 vinculada ao escritório" },
    { date: "05/01/2025", time: "09:15", user: "LLZ Sistema",     type: "Cadastro",   unit: "Apto 65",   desc: "Unidade Apto 65 vinculada ao escritório" },
  ];
  const typeColor: Record<string, string> = {
    Processo: "bg-blue-50 text-blue-700", Pagamento: "bg-emerald-50 text-emerald-700",
    Observação: "bg-violet-50 text-violet-700", Encerramento: "bg-gray-100 text-gray-500",
    Status: "bg-amber-50 text-amber-700", Cadastro: "bg-[#EEF3FB] text-[#0042C3]",
  };
  return (
    <div className="p-6 max-w-5xl">
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-800">Histórico geral de ações</h3>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">
            {["Data", "Hora", "Usuário", "Tipo", "Unidade", "Descrição"].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {all.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono text-gray-600">{r.date}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{r.time}</td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-700">{r.user}</td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${typeColor[r.type] || "bg-gray-100 text-gray-500"}`}>{r.type}</span></td>
                <td className="px-4 py-3 text-xs font-semibold text-[#0042C3]">{r.unit}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── ProfileView ──────────────────────────────────────────────────────────────
function ProfileView() {
  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: "#0042C3" }}>JS</div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Dr. João Silva</h2>
            <p className="text-sm text-gray-500">Santos &amp; Associados Advogados</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">joao.silva@santosadvogados.com.br</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Nome", value: "Dr. João Silva" },
            { label: "OAB", value: "SP 123.456" },
            { label: "Escritório", value: "Santos & Associados" },
            { label: "Telefone", value: "(11) 9****-0000" },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{f.label}</p>
              <p className="text-sm font-medium text-gray-800">{f.value}</p>
            </div>
          ))}
        </div>
        <button className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ backgroundColor: "#0042C3" }}>
          <Edit2 className="w-3.5 h-3.5" /> Editar dados
        </button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Segurança</h3>
        <div className="space-y-3">
          {[
            { icon: Lock,       label: "Alterar senha",         sub: "Última alteração: 45 dias atrás" },
            { icon: Smartphone, label: "Autenticação em dois fatores", sub: "Ativo · Google Authenticator" },
            { icon: Monitor,    label: "Sessões ativas",         sub: "2 dispositivos conectados" },
            { icon: Shield,     label: "Dispositivos autorizados", sub: "Este computador e 1 celular" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-[#0042C3] hover:underline">Gerenciar</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PortalLayout ─────────────────────────────────────────────────────────────
function PortalLayout({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedTab, setSelectedTab] = useState<"resumo" | "processo" | "financeiro" | "timeline" | "documentos" | "historico">("resumo");
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFS);
  const [units, setUnits] = useState<Unit[]>(SEED_UNITS);
  const [incoming, setIncoming] = useState<IncomingProcess[]>(SEED_INCOMING);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const unreadCount = notifs.filter(n => !n.read).length;
  const markOneNotif = (id: number) => setNotifs(list => list.map(n => n.id === id ? { ...n, read: true } : n));

  const handleSelectUnit = (u: Unit, tab: typeof selectedTab = "resumo") => { setSelectedUnit(u); setSelectedTab(tab); setView("unit-detail"); };
  const handleSetView = (v: View) => { setView(v); if (v !== "unit-detail") setSelectedUnit(null); };

  const updateUnit = (updated: Unit) => {
    setUnits(list => list.map(u => u.id === updated.id ? updated : u));
    setSelectedUnit(prev => (prev && prev.id === updated.id ? updated : prev));
  };
  const addProcess = (newUnit: Unit) => setUnits(list => [newUnit, ...list]);
  const editProcess = (id: string, patch: Partial<Unit>) => {
    setUnits(list => list.map(u => u.id === id ? { ...u, ...patch } : u));
    setSelectedUnit(prev => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };
  const acceptIncoming = (p: IncomingProcess) => {
    const newUnit: Unit = {
      id: p.id, unit: p.unit, building: p.building, condo: p.condo, city: p.city,
      owner: p.owner, cpf: p.cpf, phone: p.phone, email: p.email,
      status: "Novo", process: p.process, value: p.value, debt: p.debt, since: "22/07/2026",
    };
    addProcess(newUnit);
    setIncoming(list => list.filter(i => i.id !== p.id));
    toast(`Processo ${p.process} aceito e vinculado ao escritório.`);
  };

  const incomingCount = incoming.length;

  const PAGE_TITLES: Record<View, { title: string; sub?: string }> = {
    dashboard:    { title: "Dashboard", sub: "Visão geral · Santos & Associados" },
    units:        { title: "Minhas Unidades", sub: `${units.length} unidades vinculadas ao escritório` },
    "unit-detail": { title: selectedUnit ? `${selectedUnit.unit} · ${selectedUnit.condo}` : "Detalhe da Unidade", sub: selectedUnit?.process },
    processes:    { title: "Processos", sub: incomingCount > 0 ? `${incomingCount} novos aguardando aceite` : "Todos os processos do escritório" },
    notifications: { title: "Notificações", sub: unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas" },
    reports:      { title: "Relatórios", sub: "Processos encerrados · somente leitura" },
    "acting-history": { title: "Histórico de Atuação", sub: "Unidades sem acesso ativo · somente leitura" },
    history:      { title: "Histórico", sub: "Auditoria completa de ações" },
    profile:      { title: "Meu Perfil", sub: "Configurações de conta e segurança" },
  };
  const { title, sub } = PAGE_TITLES[view];

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: "#EEF2F8" }}>
      <Sidebar view={view} setView={handleSetView} unreadCount={unreadCount} incomingCount={incomingCount} onLogout={onLogout}
        collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed(v => !v)} />
      <MobileNavDrawer view={view} setView={handleSetView} unreadCount={unreadCount} incomingCount={incomingCount} onLogout={onLogout}
        open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={title} subtitle={sub} view={view} setView={handleSetView} unreadCount={unreadCount} notifs={notifs} onMarkOne={markOneNotif}
          onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {view === "dashboard"     && <DashboardView units={units} setView={handleSetView} setSelectedUnit={handleSelectUnit} />}
          {view === "units"         && <UnitsView units={units} onSelectUnit={handleSelectUnit} />}
          {view === "unit-detail"   && selectedUnit && (
            <UnitDetailView unit={selectedUnit} initialTab={selectedTab} onBack={() => handleSetView("units")} onUpdateUnit={updateUnit} />
          )}
          {view === "processes"     && (
            <ProcessesView units={units} incoming={incoming}
              onSelectUnit={(u) => handleSelectUnit(u, "processo")}
              onAccept={acceptIncoming} onAddProcess={addProcess} onEditProcess={editProcess} />
          )}
          {view === "notifications" && <NotificationsView notifs={notifs} setNotifs={setNotifs} />}
          {view === "reports"       && <ReportsView units={units} />}
          {view === "acting-history" && <ActingHistoryView units={units} />}
          {view === "history"       && <HistoryView />}
          {view === "profile"       && <ProfileView />}
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <LoginView onLogin={() => setLoggedIn(true)} />;
  return <PortalLayout onLogout={() => setLoggedIn(false)} />;
}
