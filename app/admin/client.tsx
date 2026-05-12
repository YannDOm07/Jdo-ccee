"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Download, 
  Filter, 
  FileSpreadsheet, 
  Loader2, 
  GraduationCap, 
  UserCircle, 
  Globe, 
  LogOut, 
  X, 
  Trash2, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Hash
} from "lucide-react";
import * as XLSX from "xlsx";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { toast } from "sonner";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export function AdminDashboardClient({ participants: initialParticipants }: { participants: any[] }) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Tous");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
  const router = useRouter();

  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    nom: "", prenom: "", email: "", telephone: "", statut: "EXTERNE", promo: "",
    casquette_blanche: false, casquette_noire: false, casquette_verte: false, tshirt_beige: false, tshirt_vert: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/admin/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParticipant),
      });
      if (resp.ok) {
        toast.success("Participant ajouté avec succès");
        setIsAddingParticipant(false);
        setNewParticipant({
          nom: "", prenom: "", email: "", telephone: "", statut: "EXTERNE", promo: "",
          casquette_blanche: false, casquette_noire: false, casquette_verte: false, tshirt_beige: false, tshirt_vert: false
        });
        router.refresh();
      } else {
        const error = await resp.json();
        toast.error(error.error || "Erreur lors de l'ajout");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateTotal = (p: any) => {
    let total = 0;
    if (p.commandes && p.commandes.length > 0) {
      total += p.commandes.reduce((sum: number, c: any) => sum + ((c.prix || 0) * (c.quantite || 1)), 0);
    }
    return total;
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Prepare data for Excel with better formatting
      const exportData = filtered.map(p => ({
        "Date d'inscription": new Date(p.createdAt).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        "Nom": p.nom,
        "Prénom": p.prenom,
        "Email": p.email,
        "Téléphone": p.telephone,
        "Statut": p.statut === "ESATIC_CCEE" ? "CCEE" : p.statut === "ANCIEN" ? "Ancien" : "Externe",
        "Promotion": p.promo || "-",
        "Montant": calculateTotal(p),
        "Paiement": p.statutPaiement === 'GRATUIT' ? "Gratuit" : p.statutPaiement === 'EN_ATTENTE' ? "En Attente" : "Payé",
        "ID": p.id
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Date
        { wch: 15 }, // Nom
        { wch: 15 }, // Prenom
        { wch: 25 }, // Email
        { wch: 15 }, // Tel
        { wch: 10 }, // Statut
        { wch: 10 }, // Montant
        { wch: 10 }, // Paiement
        { wch: 25 }  // ID
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inscriptions_JDO");
      XLSX.writeFile(wb, `Inscriptions_JDO_2026_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setIsExporting(false);
      toast.success("Export terminé avec succès !");
    }, 1500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce participant ? Cette action est irréversible.")) return;
    
    setIsDeleting(id);
    try {
      const resp = await fetch(`/api/admin/participants/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        setParticipants(prev => prev.filter(p => p.id !== id));
        toast.success("Participant supprimé");
        if (selectedParticipant?.id === id) setSelectedParticipant(null);
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const filtered = participants.filter((p) => {
    const fullSearch = `${p.nom} ${p.prenom} ${p.email} ${p.telephone}`.toLowerCase();
    const matchSearch = fullSearch.includes(searchTerm.toLowerCase());
    
    if (activeTab === "Tous") return matchSearch;
    if (activeTab === "CCEE") return matchSearch && p.statut === "ESATIC_CCEE";
    if (activeTab === "Anciens") return matchSearch && p.statut === "ANCIEN";
    if (activeTab === "Externes") return matchSearch && p.statut === "EXTERNE";
    return matchSearch;
  });

  const totalGlobal = participants.reduce((sum, p) => sum + calculateTotal(p), 0);
  const recettesConfirmees = participants.reduce((sum, p) => p.statutPaiement === 'PAYE' ? sum + calculateTotal(p) : sum, 0);

  // Chart Data
  const cceeCount = participants.filter(p => p.statut === "ESATIC_CCEE").length;
  const ancienCount = participants.filter(p => p.statut === "ANCIEN").length;
  const externeCount = participants.filter(p => p.statut === "EXTERNE").length;

  const donutData = {
    labels: ["CCEE", "Anciens", "Externes"],
    datasets: [{
      data: [cceeCount, ancienCount, externeCount],
      backgroundColor: ["#1B3A1F", "#C8992A", "#7BAE83"],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };

  const lineData = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [{
      label: "Inscriptions",
      data: [12, 19, 15, 25, 22, 30, participants.length],
      borderColor: "#C8992A",
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    }]
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] pb-20">
      
      {/* ── Topbar ── */}
      <div className="w-full bg-[var(--forest)] h-[72px] flex items-center justify-between px-6 lg:px-10 sticky top-0 z-[50] shadow-md">
        <div>
          <h1 className="font-display text-2xl text-[var(--gold)]">Dashboard <span className="opacity-50">· JDO 2026</span></h1>
          <p className="font-body text-[10px] text-white/50 tracking-widest uppercase mt-1 italic">Gestion des Ambassadeurs du Jardin</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddingParticipant(true)}
            className="bg-white/10 text-white border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[2px] transition-all hover:bg-[var(--gold)] hover:text-[var(--forest)] flex items-center gap-2 active:scale-95"
          >
            <UserCircle size={14} />
            <span className="hidden md:inline">Inscrire un membre</span>
          </button>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-[var(--gold)] text-[var(--forest)] px-4 py-2 text-xs font-bold uppercase tracking-[2px] transition-all hover:bg-white flex items-center gap-2 shadow-sm active:scale-95"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            <span className="hidden md:inline">{isExporting ? "Export..." : "Export Excel"}</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="text-[var(--mist)] hover:text-white transition-colors flex items-center gap-2 p-2 hover:bg-white/5 rounded-full"
            title="Se déconnecter"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mt-10">
        
        {/* ── KPIs ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-[var(--mist)] p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] mb-4">Total Inscrits</h3>
            <div className="flex items-end justify-between">
              <span className="font-display text-5xl text-[var(--ink)]">{participants.length}</span>
              <div className="w-24 h-12 opacity-50">
                {mounted && <Line data={lineData} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[var(--mist)] p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] mb-4">Montant Total Global</h3>
            <div className="font-display text-4xl text-[var(--gold)]">
              {mounted ? totalGlobal.toLocaleString('fr-FR') : "0"} <span className="text-sm font-body text-[var(--moss)]">FCFA</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--mist)] flex justify-between items-center">
              <span className="font-body text-xs text-[#7BAE83] italic">Dont Confirmé (Payé):</span>
              <span className="font-bold text-sm text-[var(--forest)]">{mounted ? recettesConfirmees.toLocaleString('fr-FR') : "0"} FCFA</span>
            </div>
          </div>

          <div className="bg-white border border-[var(--mist)] p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <h3 className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] mb-4">Répartition</h3>
              <ul className="text-xs font-body space-y-2 text-[var(--ink)]">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--forest)]"></span> CCEE: {cceeCount}</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span> Anciens: {ancienCount}</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#7BAE83]"></span> Externes: {externeCount}</li>
              </ul>
            </div>
            <div className="w-[100px] h-[100px]">
              {mounted && <Doughnut data={donutData} options={{ plugins: { legend: { display: false } }, cutout: "75%" }} />}
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
          <div className="flex gap-2">
            {["Tous", "CCEE", "Anciens", "Externes"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-body text-[10px] tracking-widest uppercase border transition-all ${activeTab === tab ? "bg-[var(--forest)] text-[var(--gold)] border-[var(--forest)]" : "bg-white text-[var(--moss)] border-[var(--mist)] hover:border-[var(--forest)]"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mist)]" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher un ambre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-9 pr-10 py-2.5 bg-white border border-[var(--mist)] font-body text-sm outline-none transition-all duration-500 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20"
              style={{ width: isSearchFocused || searchTerm ? "350px" : "260px" }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mist)] hover:text-red-500 transition-colors"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-[var(--mist)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--cream)] border-b border-[var(--mist)]">
                  <th className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] p-4 font-bold">Participant</th>
                  <th className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] p-4 font-bold">Contact</th>
                  <th className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] p-4 font-bold">Statut</th>
                  <th className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] p-4 font-bold">Paiement</th>
                  <th className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mist)]/30">
                {filtered.map((p, i) => (
                  <tr key={p.id} className="group transition-colors hover:bg-[rgba(200,153,42,0.03)] opacity-0 animate-[revealUp_0.5s_ease_forwards]" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="p-4">
                      <div className="font-display text-base text-[var(--ink)] group-hover:text-[var(--forest)] transition-colors">{p.prenom} {p.nom}</div>
                      <div className="font-body text-[10px] text-[var(--moss)] opacity-60 tracking-wider flex gap-2 items-center">
                        <span>ID: {p.id.substring(0,8)}...</span>
                        {p.promo && <span className="bg-[var(--gold)]/10 text-[var(--gold)] px-1.5 py-0.5 rounded font-bold text-[8px]">{p.promo}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-body text-sm text-[var(--ink)] flex items-center gap-1.5"><Mail size={12} className="text-[var(--mist)]"/> {p.email}</div>
                      <div className="font-body text-xs text-[var(--moss)] mt-1 flex items-center gap-1.5"><Phone size={12} className="text-[var(--mist)]"/> {p.telephone}</div>
                    </td>
                    <td className="p-4">
                      {p.statut === "ESATIC_CCEE" && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(27,58,31,0.05)] text-[var(--forest)] text-[10px] font-bold uppercase tracking-wider border border-[var(--forest)]/10 rounded-full"><GraduationCap size={12}/> CCEE</span>}
                      {p.statut === "ANCIEN" && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(200,153,42,0.05)] text-[#B08625] text-[10px] font-bold uppercase tracking-wider border border-[#B08625]/10 rounded-full"><UserCircle size={12}/> Ancien</span>}
                      {p.statut === "EXTERNE" && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(123,174,131,0.05)] text-[#5F8A66] text-[10px] font-bold uppercase tracking-wider border border-[#5F8A66]/10 rounded-full"><Globe size={12}/> Externe</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          {p.statutPaiement === 'EN_ATTENTE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${p.statutPaiement === 'GRATUIT' ? 'bg-gray-300' : p.statutPaiement === 'EN_ATTENTE' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                        </span>
                        <span className="font-body text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
                          {p.statutPaiement === 'GRATUIT' ? "Gratuit" : p.statutPaiement === 'EN_ATTENTE' ? "En Attente" : "Payé"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedParticipant(p)}
                          className="p-2 text-[var(--moss)] hover:text-[var(--forest)] hover:bg-[var(--cream)] rounded transition-all"
                          title="Détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          disabled={isDeleting === p.id}
                          className="p-2 text-[var(--moss)] hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Supprimer"
                        >
                          {isDeleting === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Inscription Manuelle ── */}
      {isAddingParticipant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--ink)]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-xl w-full shadow-2xl border border-[var(--gold)]/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--gold)]" />
            
            <div className="p-8 flex justify-between items-start border-b border-[var(--mist)]/20">
              <div>
                <h2 className="font-display text-2xl text-[var(--ink)] text-gold">Inscrire un membre</h2>
                <p className="font-body text-xs text-[var(--moss)] uppercase tracking-widest mt-1">Enregistrement manuel / Espèces</p>
              </div>
              <button onClick={() => setIsAddingParticipant(false)} className="p-2 text-[var(--mist)] hover:text-[var(--ink)]">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" required placeholder="NOM" 
                  value={newParticipant.nom} onChange={e => setNewParticipant({...newParticipant, nom: e.target.value})}
                  className="p-4 bg-[var(--cream)] border border-[var(--mist)]/30 font-body text-sm outline-none focus:border-[var(--gold)]"
                />
                <input 
                  type="text" required placeholder="Prénom" 
                  value={newParticipant.prenom} onChange={e => setNewParticipant({...newParticipant, prenom: e.target.value})}
                  className="p-4 bg-[var(--cream)] border border-[var(--mist)]/30 font-body text-sm outline-none focus:border-[var(--gold)]"
                />
              </div>
              <input 
                type="email" required placeholder="Email" 
                value={newParticipant.email} onChange={e => setNewParticipant({...newParticipant, email: e.target.value})}
                className="w-full p-4 bg-[var(--cream)] border border-[var(--mist)]/30 font-body text-sm outline-none focus:border-[var(--gold)]"
              />
              <input 
                type="tel" required placeholder="+22501XXXXXXXX" 
                value={newParticipant.telephone} onChange={e => setNewParticipant({...newParticipant, telephone: e.target.value})}
                className="w-full p-4 bg-[var(--cream)] border border-[var(--mist)]/30 font-body text-sm outline-none focus:border-[var(--gold)]"
              />
              
              <div className="p-4 bg-[var(--cream)] border border-[var(--mist)]/30">
                <label className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] block mb-2">Statut du Participant</label>
                <select 
                  value={newParticipant.statut} 
                  onChange={e => setNewParticipant({...newParticipant, statut: e.target.value})}
                  className="w-full bg-transparent font-body text-sm outline-none"
                >
                  <option value="ESATIC_CCEE">Étudiant CCEE (Gratuit)</option>
                  <option value="ANCIEN">Ancien Étudiant</option>
                  <option value="EXTERNE">Participant Externe</option>
                </select>
              </div>

              {(newParticipant.statut === "ESATIC_CCEE" || newParticipant.statut === "ANCIEN") && (
                <div className="p-4 bg-[var(--cream)] border border-[var(--mist)]/30">
                  <label className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)] block mb-2">Promotion (Niveau IT)</label>
                  <select 
                    value={newParticipant.promo} 
                    onChange={e => setNewParticipant({...newParticipant, promo: e.target.value})}
                    className="w-full bg-transparent font-body text-sm outline-none"
                    required
                  >
                    <option value="">Sélectionner la promo</option>
                    <option value="IT14">IT14 (L1)</option>
                    <option value="IT13">IT13 (L2)</option>
                    <option value="IT12">IT12 (L3)</option>
                    <option value="IT11">IT11 (M1)</option>
                    <option value="IT10">IT10</option>
                    <option value="IT9">IT9</option>
                    <option value="IT8">IT8</option>
                    <option value="IT7">IT7 (Ancien)</option>
                    <option value="IT6">IT6 (Ancien)</option>
                    <option value="IT5">IT5 (Ancien)</option>
                    <option value="IT4">IT4 (Ancien)</option>
                    <option value="IT3">IT3 (Ancien)</option>
                    <option value="IT2">IT2 (Ancien)</option>
                    <option value="IT1">IT1 (Ancien)</option>
                  </select>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <p className="font-body text-[10px] uppercase tracking-widest text-[var(--moss)]">Goodies supplémentaires</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'casquette_blanche', label: 'Casq. Blanche' },
                    { key: 'casquette_noire', label: 'Casq. Noire' },
                    { key: 'casquette_verte', label: 'Casq. Verte' },
                    { key: 'tshirt_beige', label: 'T-Shirt Beige' },
                    { key: 'tshirt_vert', label: 'T-Shirt Vert' }
                  ].map((item) => (
                    <button 
                      key={item.key} type="button"
                      onClick={() => setNewParticipant({...newParticipant, [item.key]: !(newParticipant as any)[item.key]})}
                      className={`py-2 px-1 text-[8px] sm:text-[10px] sm:px-3 font-bold uppercase tracking-widest border transition-all text-center ${(newParticipant as any)[item.key] ? "bg-[var(--gold)] text-[var(--forest)] border-[var(--gold)]" : "bg-white text-[var(--moss)] border-[var(--mist)]"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimation du total dans le modal */}
              <div className="mt-6 p-4 bg-[var(--forest)] text-[var(--gold)] border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-body text-[10px] uppercase tracking-widest opacity-70">Total à encaisser :</span>
                  <span className="font-display text-xl">
                    {(() => {
                      let total = 0;
                      // Frais d'inscription
                      const it = parseInt(newParticipant.promo.replace(/[^0-9]/g, ''));
                      if (it === 14) total += 5000;
                      else if (it === 13) total += 7000;
                      else if (it === 12) total += 7500;
                      else if (it === 11) total += 8000;
                      else if (it === 10 || it === 9) total += 10000;
                      else if (!isNaN(it) && it <= 8) total += 10000;
                      
                      if ((newParticipant as any).casquette_blanche) total += 2000;
                      if ((newParticipant as any).casquette_noire) total += 2000;
                      if ((newParticipant as any).casquette_verte) total += 2000;
                      if ((newParticipant as any).tshirt_beige) total += 3000;
                      if ((newParticipant as any).tshirt_vert) total += 3000;
                      return total.toLocaleString('fr-FR');
                    })()} FCFA
                  </span>
                </div>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full py-5 bg-[var(--gold)] text-[var(--forest)] font-display text-sm uppercase tracking-widest mt-8 transition-all hover:bg-[var(--forest)] hover:text-white flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Confirmer l'inscription"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Détails ── */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--ink)]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-2xl w-full shadow-2xl border border-[var(--gold)]/20 relative overflow-hidden flex flex-col max-h-[90svh]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--gold)]" />
            
            <div className="p-8 flex justify-between items-start border-b border-[var(--mist)]/20">
              <div>
                <h2 className="font-display text-3xl text-[var(--ink)]">{selectedParticipant.prenom} {selectedParticipant.nom}</h2>
                <p className="font-body text-xs text-[var(--moss)] uppercase tracking-widest mt-1">Fiche Participant Officielle</p>
              </div>
              <button onClick={() => setSelectedParticipant(null)} className="p-2 text-[var(--mist)] hover:text-[var(--ink)] hover:bg-[var(--cream)] transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 font-display text-sm uppercase tracking-widest text-[var(--gold)] mb-3"><UserCircle size={14}/> Profil</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between border-b border-[var(--mist)]/20 pb-2">
                        <span className="text-xs text-[var(--moss)]">Statut</span>
                        <span className="text-sm font-bold">{selectedParticipant.statut} {selectedParticipant.promo && `(${selectedParticipant.promo})`}</span>
                     </div>
                    <div className="flex justify-between border-b border-[var(--mist)]/20 pb-2">
                       <span className="text-xs text-[var(--moss)]">Inscrit le</span>
                       <span className="text-sm">{new Date(selectedParticipant.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--mist)]/20 pb-2">
                       <span className="text-xs text-[var(--moss)]">ID Unique</span>
                       <span className="text-[10px] font-mono bg-[var(--cream)] px-1.5 py-0.5">{selectedParticipant.id}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 font-display text-sm uppercase tracking-widest text-[var(--gold)] mb-3"><Phone size={14}/> Contact</h4>
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2"><Mail size={14} className="text-[var(--mist)]"/> {selectedParticipant.email}</p>
                    <p className="flex items-center gap-2"><Phone size={14} className="text-[var(--mist)]"/> {selectedParticipant.telephone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[var(--cream)] p-6 border border-[var(--mist)]/30">
                  <h4 className="flex items-center gap-2 font-display text-sm uppercase tracking-widest text-[var(--gold)] mb-4"><CreditCard size={14}/> Paiement & Commandes</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--moss)]">Montant Total</span>
                      <span className="text-xl font-display text-[var(--forest)]">{mounted ? calculateTotal(selectedParticipant).toLocaleString('fr-FR') : "0"} FCFA</span>
                    </div>
                    <div className={`text-center py-2 text-[10px] font-bold uppercase tracking-widest ${selectedParticipant.statutPaiement === 'PAYE' ? 'bg-green-100 text-green-700' : selectedParticipant.statutPaiement === 'EN_ATTENTE' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                       {selectedParticipant.statutPaiement === 'PAYE' ? 'Tout est payé ✓' : selectedParticipant.statutPaiement === 'EN_ATTENTE' ? 'Paiement(s) en attente' : 'Inscription gratuite'}
                    </div>
                    
                    {/* ── Paiements Wave en attente de vérification ── */}
                    {selectedParticipant.paiements && selectedParticipant.paiements.filter((p: any) => p.statut === 'EN_ATTENTE').length > 0 && (
                      <div className="pt-4 border-t border-[var(--mist)]/50 space-y-3">
                        <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold flex items-center gap-1">⚠ Paiements à vérifier</p>
                        {selectedParticipant.paiements.filter((p: any) => p.statut === 'EN_ATTENTE').map((pay: any) => (
                          <div key={pay.id} className="bg-amber-50 border border-amber-200 p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase tracking-widest text-[var(--moss)]">{pay.operateur}</span>
                              <span className="font-display text-sm text-[var(--forest)]">{pay.montant} FCFA</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2 border border-amber-100">
                              <Hash size={12} className="text-amber-500 shrink-0" />
                              <span className="font-mono text-xs text-[var(--ink)] select-all break-all">{pay.transactionId?.split('_')[0]}</span>
                            </div>
                            <p className="text-[10px] text-[var(--moss)] italic">Vérifiez cet ID dans votre historique Wave marchand avant de confirmer.</p>
                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={async () => {
                                  if (!confirm("Confirmer ce paiement ? Cette action est irréversible.")) return;
                                  try {
                                    const res = await fetch("/api/admin/paiements", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ paiementId: pay.id, action: "CONFIRMER" })
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error);
                                    toast.success("Paiement confirmé ! QR Code activé.");
                                    
                                    // Update local state so it moves to confirmed without closing modal
                                    setSelectedParticipant((prev: any) => ({
                                      ...prev,
                                      statutPaiement: "PAYE",
                                      paiements: prev.paiements.map((p: any) => p.id === pay.id ? { ...p, statut: "PAYE" } : p),
                                      commandes: prev.commandes.map((c: any) => c.statut === "EN_ATTENTE" ? { ...c, statut: "PAYE" } : c)
                                    }));
                                    router.refresh();
                                  } catch (err: any) { toast.error(err.message); }
                                }}
                                className="flex-1 py-2 bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                              >
                                ✓ Confirmer
                              </button>
                              <button 
                                onClick={async () => {
                                  if (!confirm("Rejeter ce paiement ? Le participant devra repayer.")) return;
                                  try {
                                    const res = await fetch("/api/admin/paiements", {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ paiementId: pay.id, action: "REJETER" })
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error);
                                    toast.success("Paiement rejeté.");
                                    
                                    // Update local state so it moves to rejected without closing modal
                                    setSelectedParticipant((prev: any) => ({
                                      ...prev,
                                      paiements: prev.paiements.map((p: any) => p.id === pay.id ? { ...p, statut: "REJETE" } : p)
                                    }));
                                    router.refresh();
                                  } catch (err: any) { toast.error(err.message); }
                                }}
                                className="flex-1 py-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                              >
                                ✗ Rejeter
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Paiements confirmés ── */}
                    {selectedParticipant.paiements && selectedParticipant.paiements.filter((p: any) => p.statut === 'PAYE').length > 0 && (
                      <div className="pt-4 border-t border-[var(--mist)]/50 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold">✓ Paiements confirmés</p>
                        {selectedParticipant.paiements.filter((p: any) => p.statut === 'PAYE').map((pay: any) => (
                          <div key={pay.id} className="flex justify-between items-center bg-green-50 p-2 border border-green-100 text-xs">
                            <span className="text-[var(--moss)]">{pay.operateur} — <span className="font-mono text-[10px]">{pay.transactionId?.split('_')[0]}</span></span>
                            <span className="font-bold text-green-700">{pay.montant} F ✓</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Paiements rejetés ── */}
                    {selectedParticipant.paiements && selectedParticipant.paiements.filter((p: any) => p.statut === 'REJETE').length > 0 && (
                      <div className="pt-4 border-t border-[var(--mist)]/50 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold">✗ Paiements rejetés</p>
                        {selectedParticipant.paiements.filter((p: any) => p.statut === 'REJETE').map((pay: any) => (
                          <div key={pay.id} className="flex justify-between items-center bg-red-50 p-2 border border-red-100 text-xs">
                            <span className="text-[var(--moss)]">{pay.operateur} — <span className="font-mono text-[10px]">{pay.transactionId?.split('_')[0]}</span></span>
                            <span className="font-bold text-red-500">{pay.montant} F ✗</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedParticipant.commandes && selectedParticipant.commandes.length > 0 && (
                      <div className="pt-4 border-t border-[var(--mist)]/50">
                        <p className="text-[10px] uppercase tracking-widest text-[var(--moss)] mb-3">Articles commandés</p>
                        <ul className="text-xs space-y-2">
                          {selectedParticipant.commandes.map((c: any, i: number) => (
                            <li key={i} className="flex justify-between items-center bg-white/50 p-2 border border-black/5">
                              <span>{c.article} (x{c.quantite})</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{c.prix} F</span>
                                <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase ${c.statut === 'PAYE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {c.statut === 'PAYE' ? 'Payé' : 'En attente'}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    handleDelete(selectedParticipant.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-[2px] text-red-600 hover:bg-red-50 border border-red-100 transition-all"
                >
                  <Trash2 size={14} /> Supprimer le Participant
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-[var(--cream)] border-t border-[var(--mist)]/20 mt-auto text-center">
               <button onClick={() => setSelectedParticipant(null)} className="btn-gold !px-12 !py-4 magnetic">
                 <span className="relative z-10">Fermer la Fiche</span>
               </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
// X icon for the search bar
function XIcon(props: any) { 
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ); 
}
