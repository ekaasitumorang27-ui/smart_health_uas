exports.getDoctorRecommendation = (diagnosis) => {
  const d = diagnosis.toLowerCase();

  if (d.includes("demam") || d.includes("flu") || d.includes("batuk")) {
    return "Dokter Umum";
  }

  if (d.includes("jantung") || d.includes("tekanan darah")) {
    return "Dokter Spesialis Jantung";
  }

  if (d.includes("kulit") || d.includes("gatal") || d.includes("jerawat")) {
    return "Dokter Kulit";
  }

  if (d.includes("mata") || d.includes("penglihatan")) {
    return "Dokter Mata";
  }

  return "Dokter Umum (cek lebih lanjut)";
};