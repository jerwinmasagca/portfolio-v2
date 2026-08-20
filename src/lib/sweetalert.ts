import Swal from "sweetalert2";

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#0c152e",
  color: "#f8fafc",
  customClass: {
    popup: "border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.25)] rounded-2xl text-sm font-sans",
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const CyberAlert = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      background: "#0c152e",
      color: "#f8fafc",
      confirmButtonColor: "#06b6d4",
      confirmButtonText: "Acknowledge",
      customClass: {
        popup: "border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)] rounded-3xl backdrop-blur-xl font-sans",
        title: "font-syne font-bold text-white text-xl",
        htmlContainer: "text-slate-300 text-sm",
        confirmButton: "px-6 py-2.5 rounded-xl font-semibold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer",
      },
    });
  },

  error: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      background: "#0c152e",
      color: "#f8fafc",
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Close",
      customClass: {
        popup: "border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.3)] rounded-3xl backdrop-blur-xl font-sans",
        title: "font-syne font-bold text-white text-xl",
        htmlContainer: "text-slate-300 text-sm",
        confirmButton: "px-6 py-2.5 rounded-xl font-semibold text-white cursor-pointer",
      },
    });
  },

  confirm: async (title: string, text: string, confirmText: string = "Yes, Delete") => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
      background: "#0c152e",
      color: "#f8fafc",
      customClass: {
        popup: "border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)] rounded-3xl backdrop-blur-xl font-sans",
        title: "font-syne font-bold text-white text-xl",
        htmlContainer: "text-slate-300 text-sm",
        confirmButton: "px-5 py-2.5 rounded-xl font-semibold text-white cursor-pointer mr-2",
        cancelButton: "px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white cursor-pointer",
      },
    });
  },
};

export default Swal;
