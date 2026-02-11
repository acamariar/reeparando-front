import { useNavigate } from "react-router-dom";
import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useBoundStore } from "../store";



type LoginForm = { usuario: string; clave: string };


const schema = yup.object({
    usuario: yup.string().required("Ingresa tu usuario"),
    clave: yup.string().required("Ingresa tu clave"),
});


export default function Login() {
    const navigate = useNavigate();
    const login = useBoundStore((s) => s.login);
    const isLoading = useBoundStore((s) => s.isLoading);
    const error = useBoundStore((s) => s.error);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: yupResolver(schema),
        defaultValues: { usuario: "", clave: "" },
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data.usuario, data.clave);
            navigate("/panel");
        } catch {
            /* el slice ya setea error */
        }
    };



    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/img/fondo.jpg')" }}>
            <div className="bg-white/70 bg-opacity p-8 pt-0 rounded-lg shadow-md w-full max-w-md h-fit">
                <div className="text-center">
                    <img src="/img/logo1.png" alt="Logo" className="w-full  mx-auto" />
                </div>
                <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">Iniciar Sesión</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input
                        type="text"
                        placeholder="Usuario"
                        {...register("usuario")}
                        className="w-full px-4 py-2 mb-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.usuario && <p className="text-red-600 text-sm mb-2">{errors.usuario.message}</p>}

                    <input
                        type="password"
                        placeholder="Clave"
                        {...register("clave")}
                        className="w-full px-4 py-2 mb-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.clave && <p className="text-red-600 text-sm mb-4">{errors.clave.message}</p>}

                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        {isSubmitting || isLoading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}