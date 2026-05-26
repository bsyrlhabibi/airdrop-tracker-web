const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function exportToExcel() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/export/excel`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Export failed: ${res.status}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `airdrop-tracker-export-${date}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export Excel file");
  }
}
