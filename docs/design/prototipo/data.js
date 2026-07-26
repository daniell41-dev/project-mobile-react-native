/* Datos de ejemplo — Nimbo (es-MX, MXN) */
(function () {
  const fmt = new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 2,
  });
  // monto con signo, sin símbolo duplicado
  function money(n) { return fmt.format(n); }
  function moneyAbs(n) { return fmt.format(Math.abs(n)); }

  const tx = [
    { id: "t1", merchant: "Nómina · ACME S.A.", cat: "Ingresos", icon: "salary", amount: 18400, date: "Hoy", time: "08:02", day: "Hoy", method: "Depósito SPEI", ref: "SPEI 7741920" },
    { id: "t2", merchant: "Spotify Premium", cat: "Suscripciones", icon: "music", amount: -199, date: "Hoy", time: "07:14", day: "Hoy", method: "Nimbo Débito ·· 4821", ref: "SUB-2291" },
    { id: "t3", merchant: "OXXO", cat: "Tiendas", icon: "store", amount: -87.5, date: "Hoy", time: "21:36", day: "Hoy", method: "Nimbo Débito ·· 4821", ref: "POS-58210" },
    { id: "t4", merchant: "Uber", cat: "Transporte", icon: "car", amount: -142, date: "Ayer", time: "19:48", day: "Ayer", method: "Nimbo Crédito ·· 0573", ref: "TRP-44910" },
    { id: "t5", merchant: "Mariana López", cat: "Transferencia", icon: "person", amount: -1200, date: "Ayer", time: "15:20", day: "Ayer", method: "SPEI a BBVA", ref: "SPEI 7740112" },
    { id: "t6", merchant: "Starbucks", cat: "Comida", icon: "coffee", amount: -98, date: "Ayer", time: "09:11", day: "Ayer", method: "Nimbo Débito ·· 4821", ref: "POS-11820" },
    { id: "t7", merchant: "Amazon México", cat: "Compras", icon: "bag", amount: -649, date: "4 jun", time: "12:03", day: "4 jun", method: "Nimbo Crédito ·· 0573", ref: "ORD-99213" },
    { id: "t8", merchant: "Devolución · Liverpool", cat: "Reembolso", icon: "refund", amount: 1299, date: "3 jun", time: "16:40", day: "3 jun", method: "Nimbo Crédito ·· 0573", ref: "REF-30021" },
    { id: "t9", merchant: "CFE", cat: "Servicios", icon: "bolt", amount: -540, date: "3 jun", time: "10:25", day: "3 jun", method: "Domiciliación", ref: "SRV-CFE-882" },
    { id: "t10", merchant: "Cinépolis", cat: "Entretenimiento", icon: "ticket", amount: -260, date: "2 jun", time: "20:15", day: "2 jun", method: "Nimbo Débito ·· 4821", ref: "POS-77410" },
  ];

  const contacts = [
    { id: "c1", name: "Mariana López", sub: "BBVA ·· 2291", initials: "ML", recent: true },
    { id: "c2", name: "Carlos Ruiz", sub: "Nimbo ·· 7740", initials: "CR", recent: true },
    { id: "c3", name: "Sofía Hernández", sub: "Santander ·· 1188", initials: "SH", recent: true },
    { id: "c4", name: "Diego Torres", sub: "Nimbo ·· 0912", initials: "DT", recent: false },
    { id: "c5", name: "Renta · Depto 4B", sub: "Banorte ·· 5520", initials: "RD", recent: false },
  ];

  const categories = [
    { name: "Compras", pct: 32, color: "#4C8DFF", amount: 4180 },
    { name: "Servicios", pct: 18, color: "#3FD1A0", amount: 2350 },
    { name: "Transporte", pct: 15, color: "#F5A623", amount: 1960 },
    { name: "Comida", pct: 13, color: "#B98BFF", amount: 1700 },
    { name: "Suscripciones", pct: 9, color: "#FF8A8A", amount: 1175 },
    { name: "Otros", pct: 13, color: "#7C879A", amount: 1700 },
  ];

  const months = [
    { mo: "Ene", v: 0.55 }, { mo: "Feb", v: 0.72 }, { mo: "Mar", v: 0.48 },
    { mo: "Abr", v: 0.84 }, { mo: "May", v: 0.66 }, { mo: "Jun", v: 0.93, cur: true },
  ];

  window.DATA = {
    money, moneyAbs,
    user: { name: "Andrea Salas", initials: "AS", balance: 48250.75, account: "CLABE ·· 4821" },
    tx, contacts, categories, months,
  };
})();
