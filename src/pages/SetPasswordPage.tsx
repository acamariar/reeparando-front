import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios/mainAxios";
import { useBoundStore } from "../store";

export default function SetPasswordPage() {
    const navigate = useNavigate();
    const user = useBoundStore((s) => s.user);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");


        if (!user || !user.id) {
            setError("Usuario no válido.");
            return;
        }

        if (!newPassword.trim()) {
            setError("Ingresá una nueva contraseña.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            // Cambiá esta URL si tu backend usa otra ruta
            await api.patch(`/usuarios/${user.id}`, {
                user: user.usuario,
                clave: newPassword,
                passwordSet: true,
            });

            setSuccess("Contraseña actualizada correctamente.");

            setTimeout(() => {
                navigate("/panel");
            }, 800);
        } catch (err) {
            console.error(err);
            setError("No se pudo guardar la nueva contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-cover bg-center px-4"
            style={{ backgroundImage: "url('/img/fondo.jpg')" }}
        >
            <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm">
                <div className="text-center">
                    <img
                        src="/img/logo1.png"
                        alt="Logo"
                        className="mx-auto mb-4 w-full max-w-[250px]"
                    />
                </div>

                <h1 className="mb-2 text-center text-2xl font-bold text-slate-800">
                    Setear contraseña
                </h1>
                <p className="mb-6 text-center text-sm text-slate-600">
                    Debés definir una nueva contraseña para continuar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Escribí tu nueva clave"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Repetí tu nueva clave"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-primary py-2 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Guardando..." : "Guardar contraseña"}
                    </button>
                </form>
            </div>
        </div>
    );
}